/* eslint-disable @typescript-eslint/ban-ts-comment */
import type { Student } from '../model/user';
import type { Course, CoursePlan } from '../model/course';
import { CoursePlanModel, DegreeRequirementsModel } from '../server/models';
import type { SubArea } from '../model/degreeRequirements';

/*
for the summary information, requirements are counted as follows.
for requirements involving core (mandatory) and elective courses are counted,
each such course is counted as a separate requirement, to provide more
fine-grained measurement of progress.
for example, if a student needs to take 5 core courses and 4 electives,
there are 9 requirements to be satisfied.  a project or thesis counts as 1 requirement,
even if it is satisfied by taking multiple courses, e.g.,
CSE advanced project requirement is satisfied by taking CSE 523 and CSE 524,
and the BMI/CSE/ESE thesis requirement is satisfied by taking at least 6 credits of BMI/CSE/ESE 599,
which is usually (though not necessarily) done by taking that course twice for 3 credits each.
GPA requirement counts as 1 requirement, even if it is multi-faceted, e.g.,
even if it imposes minimums on both cumulative GPA and departmental GPA.
number-of-credits requirement counts as 1 requirement.
*/

export async function requirementStatus(s: Student): Promise<[number, number, number]> {
  let reqStatus: [number, number, number] = [0, 0, 0];// satisfied,pending,unsatisfied
  let numPending = 0;
  let satisfied = 0;
  let unsatisfied = 0;
  const coursePlans = await CoursePlanModel.find({ sbuId: s.sbuId }) as CoursePlan[];
  let department = '';
  if (s.department === 'CSE') {
    department = 'Computer Science';
  }
  if (s.department === 'AMS') {
    department = 'Applied Mathematics and Statistics';
  }
  if (s.department === 'ECE') {
    department = 'Computer Engineering';
  }
  if (s.department === 'BMI') {
    department = 'Biomedical Informatics';
  }

  const degree = await DegreeRequirementsModel.findOne({ requirementVersion: `${s.requirementVersionSemester} ${s.requirementVersionYear}`, degreeName: department });
  if (degree?.degreeName === 'Computer Science') {
    const completed: Array<number> = [];
    const pending: Array<number> = [];
    const grades: Array<number> = [];
    Object.values(coursePlans).forEach((v) => {
      if (v.grade === 0) {
        pending.push(v.courseNum);
      } else {
        completed.push(v.courseNum);
        if (v.grade) grades.push(v.grade);
      }
    });
    let creditsTaken = 0;
    const b = degree.breaths as SubArea[]; // check if at least one course from each subarea is completed
    for (let index = 0; index < b.length; index++) {
      let p = 0;
      let c = 0;
      let subArea = false;
      const x = b[index]?.courses;
      if (x) {
        Object.values(x).forEach((value) => {
          Object.values(pending).forEach((value2) => {
            if (value.number === value2 && subArea === false) {
              subArea = true;
              p += 1;
            }
          });
          Object.values(pending).forEach((value2) => {
            if (value.number === value2 && subArea === false) {
              subArea = true;
              c += 1;
            }
          });
        });
      }
      if (subArea === false) {
        unsatisfied += 1;
      }
      satisfied += c;
      numPending += p;
    }
    const studentTrack = s.track;
    let trackNum = -1;
    for (let index = 0; index < degree.tracks.length; index++) {
      // @ts-ignore;
      if (degree.tracks[index].name === studentTrack) {
        trackNum = index;
      }
    }
    let temp1 = 0;
    for (let value = 0; value < pending.length; value++) { // if thesis isued for more than 9 credits remove it
      if (pending[value] === 599) {
        temp1 += 1;
        if (temp1 >= 3) {
          delete pending[value];
          creditsTaken += 3;
        }
      }
    }
    let temp2 = 0;
    for (let value = 0; value < completed.length; value++) { // if thesis isued for more than 9 credits remove it
      if (completed[value] === 599) {
        temp2 += 1;
        if ((temp1 + temp2) >= 3) {
          delete completed[value];
          creditsTaken += 3;
        }
      }
    }
    // thesis requirement
    if (degree.tracks[trackNum]?.thesisRequired) {
      if (temp2 >= 3) {
        satisfied += 1;
      } else if ((temp1 + temp2) >= 3) {
        numPending += 1;
      } else {
        unsatisfied += 1;
      }
    }

    const creditsNeeded = degree.tracks[trackNum]?.totalCredits;

    let grade = 0;
    Object.values(grades).forEach((value) => {
      grade += value;
    });
    grade /= grades.length; // check grade reqirement
    if (grade >= +degree.minimumCumulativeGPA) {
      satisfied += 1;
    } else {
      unsatisfied += 1;
    }

    const core = degree.tracks[trackNum]?.coreCourses;
    if (core) { // check number of core courses
      let numCore = core.length;
      Object.values(core).forEach((value) => {
        for (let value2 = 0; value2 < pending.length; value2++) {
          if (value.number === pending[value2]) {
            delete pending[value2];
            creditsTaken += 3;
            numPending += 1;
            numCore -= 1;
            break;
          }
        }
        for (let value2 = 0; value2 < completed.length; value2++) {
          if (value.number === completed[value2]) {
            delete completed[value2];
            numPending += 1;
            numCore -= 1;
            break;
          }
        }
      });
      unsatisfied += numCore;
    }
    // take out unapplicable courses
    const unapplicable = degree.tracks[trackNum]?.unapplicableCoursesCredits;
    for (let value = 0; value < pending.length; value++) {
      if (unapplicable) {
        for (let value2 = 0; value2 < unapplicable.length; value2++) {
          const co = unapplicable[value2]?.number;
          if (co) {
            if (co === pending[value]) {
              delete pending[value];
            }
          }
        }
      }
    }
    for (let value = 0; value < completed.length; value++) {
      if (unapplicable) {
        for (let value2 = 0; value2 < unapplicable.length; value2++) {
          const co = unapplicable[value2]?.number;
          if (co) {
            if (co === completed[value]) {
              delete completed[value];
            }
          }
        }
      }
    }
    let add = 0;
    const check = degree.tracks[trackNum]?.additionalRequirement;
    if (check) {
      const arr = check.courses;
      if (arr) { // handle additional requirement
        for (let value = 0; value < arr.length; value++) {
          const co = arr[value] as Course;
          for (let value2 = 0; value < completed.length; value2++) {
            if (co.number === completed[value2]) {
              add += 1;
            }
            if (completed[value2] as number >= 600 && check.sixHundredCourses === true) {
              add += 1;
            }
            const maxcred = check.maxcredits;
            if (maxcred) {
              for (let value2 = 0; value < completed.length; value2++) {
                if (co.number === completed[value2]) {
                  add += 1;
                  if ((add * 3) > maxcred) {
                    creditsTaken += 3;
                    delete completed[value2];
                  }
                }
                if (completed[value2] as number >= 600 && check.sixHundredCourses === true) {
                  add += 1;
                  if ((add * 3) > maxcred) {
                    creditsTaken += 3;
                    delete completed[value2];
                  }
                }
              }
              for (let value2 = 0; value < pending.length; value2++) {
                if (co.number === pending[value2]) {
                  add += 1;
                  if ((add * 3) > maxcred) {
                    creditsTaken += 3;
                    delete pending[value2];
                  }
                }
                if (pending[value2] as number >= 600 && check.sixHundredCourses === true) {
                  add += 1;
                  if ((add * 3) > maxcred) {
                    creditsTaken += 3;
                    delete pending[value2];
                  }
                }
              }
            }
          }
        }
      }
      creditsTaken += (pending.length * 3);
      creditsTaken += (completed.length * 3);
      if (creditsNeeded) { // check credits requriement
        if (creditsTaken >= creditsNeeded) {
          satisfied += 1;
        } else {
          numPending += 1;
        }
      }
      const temp = degree.tracks[trackNum]?.additionalCourses;
      if (temp) {
        if (completed.length >= temp) {
          satisfied += temp;
        } else if ((pending.length + completed.length) >= temp) {
          satisfied += completed.length;
          numPending += (temp - completed.length);
        } else {
          satisfied += completed.length;
          numPending += pending.length;
          unsatisfied += (temp - (pending.length + completed.length));
        }
      }
    }
    reqStatus = [satisfied, numPending, unsatisfied];
  }

  if (degree?.degreeName === 'Applied Mathematics and Statistics') {
    let creditsTaken = 0;
    const completed: Array<number> = [];
    const pending: Array<number> = [];
    const grades: Array<number> = [];
    Object.values(coursePlans).forEach((v) => {
      if (v.grade === 0) {
        pending.push(v.courseNum);
      } else {
        completed.push(v.courseNum);
        if (v.grade) grades.push(v.grade);
      }
    });
    const b = degree.breaths as SubArea[]; // check if at least one course from each subarea is completed
    for (let index = 0; index < b.length; index++) {
      let p = 0;
      let c = 0;
      let subArea = false;
      const x = b[index]?.courses;
      if (x) {
        Object.values(x).forEach((value) => {
          Object.values(pending).forEach((value2) => {
            if (value.number === value2 && subArea === false) {
              subArea = true;
              p += 1;
            }
          });
          Object.values(pending).forEach((value2) => {
            if (value.number === value2 && subArea === false) {
              subArea = true;
              c += 1;
            }
          });
        });
      }
      if (subArea === false) {
        unsatisfied += 1;
      }
      satisfied += c;
      numPending += p;
    }
    const studentTrack = s.track;
    let trackNum = -1;
    for (let index = 0; index < degree.tracks.length; index++) {
      // @ts-ignore;
      if (degree.tracks[index].name === studentTrack) {
        trackNum = index;
      }
    }
    let temp1 = 0;
    for (let value = 0; value < pending.length; value++) { // if thesis isued for more than 9 credits remove it
      if (pending[value] === 599) {
        temp1 += 1;
        if (temp1 >= 3) {
          delete pending[value];
          creditsTaken += 3;
        }
      }
    }
    let temp2 = 0;
    for (let value = 0; value < completed.length; value++) { // if thesis isued for more than 9 credits remove it
      if (completed[value] === 599) {
        temp2 += 1;
        if ((temp1 + temp2) >= 3) {
          delete completed[value];
          creditsTaken += 3;
        }
      }
    }
    // thesis requirement
    if (degree.tracks[trackNum]?.thesisRequired) {
      if (temp2 >= 3) {
        satisfied += 1;
      } else if ((temp1 + temp2) >= 3) {
        numPending += 1;
      } else {
        unsatisfied += 1;
      }
    }

    const creditsNeeded = degree.tracks[trackNum]?.totalCredits;

    let grade = 0;
    Object.values(grades).forEach((value) => {
      grade += value;
    });
    grade /= grades.length; // check grade reqirement
    if (grade >= +degree.minimumCumulativeGPA) {
      satisfied += 1;
    } else {
      unsatisfied += 1;
    }

    const core = degree.tracks[trackNum]?.coreCourses;
    if (core) { // check number of core courses
      let numCore = core.length;
      Object.values(core).forEach((value) => {
        for (let value2 = 0; value2 < pending.length; value2++) {
          if (value.number === pending[value2]) {
            delete pending[value2];
            creditsTaken += 3;
            numPending += 1;
            numCore -= 1;
            break;
          }
        }
        for (let value2 = 0; value2 < completed.length; value2++) {
          if (value.number === completed[value2]) {
            delete completed[value2];
            creditsTaken += 3;
            numPending += 1;
            numCore -= 1;
            break;
          }
        }
      });
      unsatisfied += numCore;
    }
    // take out unapplicable courses
    const unapplicable = degree.tracks[trackNum]?.unapplicableCoursesCredits;
    for (let value = 0; value < pending.length; value++) {
      if (unapplicable) {
        for (let value2 = 0; value2 < unapplicable.length; value2++) {
          const co = unapplicable[value2]?.number;
          if (co) {
            if (co === pending[value]) {
              delete pending[value];
            }
          }
        }
      }
    }
    for (let value = 0; value < completed.length; value++) {
      if (unapplicable) {
        for (let value2 = 0; value2 < unapplicable.length; value2++) {
          const co = unapplicable[value2]?.number;
          if (co) {
            if (co === completed[value]) {
              delete completed[value];
            }
          }
        }
      }
    }

    let add = 0;
    const check = degree.tracks[trackNum]?.additionalRequirement;
    if (check) {
      const arr = check.courses;
      if (arr) { // handle additional requirement
        for (let value = 0; value < arr.length; value++) {
          const co = arr[value] as Course;
          for (let value2 = 0; value < completed.length; value2++) {
            if (co.number === completed[value2]) {
              add += 1;
            }
            if (completed[value2] as number >= 600 && check.sixHundredCourses === true) {
              add += 1;
            }
            const maxcred = check.maxcredits;
            if (maxcred) {
              for (let value2 = 0; value < completed.length; value2++) {
                if (co.number === completed[value2]) {
                  add += 1;
                  if ((add * 3) > maxcred) {
                    delete completed[value2];
                    creditsTaken += 3;
                  }
                }
                if (completed[value2] as number >= 600 && check.sixHundredCourses === true) {
                  add += 1;
                  if ((add * 3) > maxcred) {
                    delete completed[value2];
                    creditsTaken += 3;
                  }
                }
              }
              for (let value2 = 0; value < pending.length; value2++) {
                if (co.number === pending[value2]) {
                  add += 1;
                  if ((add * 3) > maxcred) {
                    delete pending[value2];
                    creditsTaken += 3;
                  }
                }
                if (pending[value2] as number >= 600 && check.sixHundredCourses === true) {
                  add += 1;
                  if ((add * 3) > maxcred) {
                    delete pending[value2];
                    creditsTaken += 3;
                  }
                }
              }
            }
          }
        }

        creditsTaken += (pending.length * 3);
        creditsTaken += (completed.length * 3);
        if (creditsNeeded) { // check credits requriement
          if (creditsTaken >= creditsNeeded) {
            satisfied += 1;
          } else {
            numPending += 1;
          }
        }
        const temp = degree.tracks[trackNum]?.additionalCourses;
        if (temp) {
          if (completed.length >= temp) {
            satisfied += temp;
          } else if ((pending.length + completed.length) >= temp) {
            satisfied += completed.length;
            numPending += (temp - completed.length);
          } else {
            satisfied += completed.length;
            numPending += pending.length;
            unsatisfied += (temp - (pending.length + completed.length));
          }
        }
      }
    }
    reqStatus = [satisfied, numPending, unsatisfied];
  }

  if (degree?.degreeName === 'Biomedical Informatics') {
    let creditsTaken = 0;
    const completed: Array<number> = [];
    const pending: Array<number> = [];
    const grades: Array<number> = [];
    Object.values(coursePlans).forEach((v) => {
      if (v.grade === 0) {
        pending.push(v.courseNum);
      } else {
        completed.push(v.courseNum);
        if (v.grade) grades.push(v.grade);
      }
    });

    let grade = 0;
    Object.values(grades).forEach((value) => {
      grade += value;
    });
    grade /= grades.length; // check grade reqirement
    if (grade >= +degree.minimumCumulativeGPA) {
      satisfied += 1;
    } else {
      unsatisfied += 1;
    }

    const studentTrack = s.track;
    let trackNum = -1;
    for (let index = 0; index < degree.tracks.length; index++) {
      // @ts-ignore;
      if (degree.tracks[index]?.name === studentTrack) {
        trackNum = index;
      }
    }
    let temp1 = 0;
    for (let value = 0; value < pending.length; value++) { // if thesis isued for more than 9 credits remove it
      if (pending[value] === 599) {
        temp1 += 1;
        if (temp1 >= 3) {
          delete pending[value];
          creditsTaken += 3;
        }
      }
    }
    let temp2 = 0;
    for (let value = 0; value < completed.length; value++) { // if thesis isued for more than 9 credits remove it
      if (completed[value] === 599) {
        temp2 += 1;
        if ((temp1 + temp2) >= 3) {
          delete completed[value];
          creditsTaken += 3;
        }
      }
    }
    // thesis requirement
    if (degree.tracks[trackNum]?.thesisRequired) {
      if (temp2 >= 3) {
        satisfied += 1;
      } else if ((temp1 + temp2) >= 3) {
        numPending += 1;
      } else {
        unsatisfied += 1;
      }
    }

    const maxComb = degree.maxCreditsInCombinationY;
    if (maxComb) {
      let cred = maxComb.credits;
      Object.values(maxComb.course).forEach((value) => {
        for (let value2 = 0; value2 < completed.length; value2++) {
          if (value.number === completed[value2]) {
            if (cred > 0) {
              cred -= 3;
            } else {
              delete completed[value2];
              creditsTaken += 3;
            }
          }
        }
        for (let value2 = 0; value2 < pending.length; value2++) {
          if (value.number === pending[value2]) {
            if (cred > 0) {
              cred -= 3;
            } else {
              delete pending[value2];
              creditsTaken += 3;
            }
          }
        }
      });
    }

    const fcourse = degree.fullTimeCourseRequirement;
    const all = completed.concat(pending);
    if (fcourse) {
      const fcourseNum = fcourse.number;
      if (fcourseNum) {
        if (all.find((element) => element === fcourseNum)) {
          satisfied += 1;
        } else {
          unsatisfied += 1;
        }
      }
    }

    const maxtotal = degree.maxTotalCreditsForCourses;
    if (maxtotal) {
      let cred = maxtotal.credits;
      Object.values(maxtotal.course).forEach((value) => {
        for (let value2 = 0; value2 < completed.length; value2++) {
          if (value.number === completed[value2]) {
            if (cred > 0) {
              cred -= 3;
            } else {
              delete completed[value2];
              creditsTaken += 3;
            }
          }
        }
        for (let value2 = 0; value2 < pending.length; value2++) {
          if (value.number === pending[value2]) {
            if (cred > 0) {
              cred -= 3;
            } else {
              delete pending[value2];
              creditsTaken += 3;
            }
          }
        }
      });
    }

    const creditsNeeded = degree.tracks[trackNum]?.totalCredits;
    const core = degree.tracks[trackNum]?.coreCourses;
    if (core) { // check number of core courses
      let numCore = core.length;
      Object.values(core).forEach((value) => {
        for (let value2 = 0; value2 < pending.length; value2++) {
          if (value.number === pending[value2]) {
            delete pending[value2];
            creditsTaken += 3;
            numPending += 1;
            numCore -= 1;
            break;
          }
        }
        for (let value2 = 0; value2 < completed.length; value2++) {
          if (value.number === completed[value2]) {
            delete completed[value2];
            creditsTaken += 3;
            numPending += 1;
            numCore -= 1;
            break;
          }
        }
      });
      unsatisfied += numCore;
    }

    const ele = degree.tracks[trackNum]?.electiveCourses;
    if (ele && creditsNeeded) { // check number of core courses
      Object.values(ele).forEach((value) => {
        for (let value2 = 0; value2 < pending.length; value2++) {
          if (value.number === pending[value2] && creditsTaken < creditsNeeded) {
            delete pending[value2];
            creditsTaken += 3;
            numPending += 1;
            break;
          }
        }
        for (let value2 = 0; value2 < completed.length; value2++) {
          if (value.number === completed[value2] && creditsTaken < creditsNeeded) {
            delete completed[value2];
            creditsTaken += 3;
            numPending += 1;
            break;
          }
        }
      });
    }
    const seq = degree.tracks[trackNum]?.sequence;
    if (seq) { // check number of core courses
      let numCore = seq.length;
      Object.values(seq).forEach((value) => {
        for (let value2 = 0; value2 < pending.length; value2++) {
          if (value.number === pending[value2]) {
            delete pending[value2];
            creditsTaken += 3;
            numPending += 1;
            numCore -= 1;
            break;
          }
        }
        for (let value2 = 0; value2 < completed.length; value2++) {
          if (value.number === completed[value2]) {
            delete completed[value2];
            creditsTaken += 3;
            numPending += 1;
            numCore -= 1;
            break;
          }
        }
      });
      unsatisfied += numCore;
    }

    const unapplicable = degree.tracks[trackNum]?.unapplicableCoursesCredits;
    for (let value = 0; value < pending.length; value++) {
      if (unapplicable) {
        for (let value2 = 0; value2 < unapplicable.length; value2++) {
          const co = unapplicable[value2]?.number;
          if (co) {
            if (co === pending[value]) {
              delete pending[value];
            }
          }
        }
      }
    }
    for (let value = 0; value < completed.length; value++) {
      if (unapplicable) {
        for (let value2 = 0; value2 < unapplicable.length; value2++) {
          const co = unapplicable[value2]?.number;
          if (co) {
            if (co === completed[value]) {
              delete completed[value];
            }
          }
        }
      }
    }
    if (creditsNeeded) { // check credits requriement
      if (creditsTaken >= creditsNeeded) {
        satisfied += 1;
      } else {
        unsatisfied += (creditsNeeded - creditsTaken) / 3;
      }
    }
  }
  if (degree?.degreeName === 'Computer Engineering') {
    let creditsTaken = 0;
    const completed: Array<number> = [];
    const pending: Array<number> = [];
    const grades: Array<number> = [];
    Object.values(coursePlans).forEach((v) => {
      if (v.grade === 0) {
        pending.push(v.courseNum);
      } else {
        completed.push(v.courseNum);
        if (v.grade) grades.push(v.grade);
      }
    });

    let grade = 0;
    Object.values(grades).forEach((value) => {
      grade += value;
    });
    grade /= grades.length; // check grade reqirement
    if (grade >= +degree.minimumCumulativeGPA) {
      satisfied += 1;
    } else {
      unsatisfied += 1;
    }

    const studentTrack = s.track;
    let trackNum = -1;
    for (let index = 0; index < degree.tracks.length; index++) {
      // @ts-ignore;
      if (degree.tracks[index].name === studentTrack) {
        trackNum = index;
      }
    }
    let temp1 = 0;
    for (let value = 0; value < pending.length; value++) { // if thesis isued for more than 9 credits remove it
      if (pending[value] === 599) {
        temp1 += 1;
        if (temp1 >= 3) {
          delete pending[value];
          creditsTaken += 3;
        }
      }
    }
    let temp2 = 0;
    for (let value = 0; value < completed.length; value++) { // if thesis isued for more than 9 credits remove it
      if (completed[value] === 599) {
        temp2 += 1;
        if ((temp1 + temp2) >= 3) {
          delete completed[value];
          creditsTaken += 3;
        }
      }
    }
    // thesis requirement
    if (degree.tracks[trackNum]?.thesisRequired) {
      if (temp2 >= 3) {
        satisfied += 1;
      } else if ((temp1 + temp2) >= 3) {
        numPending += 1;
      } else {
        unsatisfied += 1;
      }
    }
    const student = degree.tracks[trackNum];
    if (student) {
      const maxComb1 = student.maxCreditsInCombinationY;
      if (maxComb1) {
        let cred = maxComb1.credits;
        Object.values(maxComb1.course).forEach((value) => {
          for (let value2 = 0; value2 < completed.length; value2++) {
            if (value.number === completed[value2]) {
              if (cred > 0) {
                cred -= 3;
              } else {
                delete completed[value2];
                creditsTaken += 3;
              }
            }
          }
          for (let value2 = 0; value2 < pending.length; value2++) {
            if (value.number === pending[value2]) {
              if (cred > 0) {
                cred -= 3;
              } else {
                delete pending[value2];
                creditsTaken += 3;
              }
            }
          }
        });
        const maxComb2 = student.xCreditsForCourseY;
        if (maxComb2) {
          let cred = maxComb2.credits;
          Object.values(maxComb2.course).forEach((value) => {
            for (let value2 = 0; value2 < completed.length; value2++) {
              if (value.number === completed[value2]) {
                if (cred > 0) {
                  cred -= 3;
                  satisfied += 1;
                } else {
                  delete completed[value2];
                  creditsTaken += 3;
                }
              }
            }
            for (let value2 = 0; value2 < pending.length; value2++) {
              if (value.number === pending[value2]) {
                if (cred > 0) {
                  cred -= 3;
                  numPending += 1;
                } else {
                  delete pending[value2];
                  creditsTaken += 3;
                }
              }
            }
          });
          unsatisfied += cred;
        }
        const maxComb = student.maxCreditsForCourseY;
        if (maxComb) {
          let cred = maxComb.credits;
          Object.values(maxComb.course).forEach((value) => {
            for (let value2 = 0; value2 < completed.length; value2++) {
              if (value.number === completed[value2]) {
                if (cred > 0) {
                  cred -= 3;
                } else {
                  delete completed[value2];
                  creditsTaken += 3;
                }
              }
            }
            for (let value2 = 0; value2 < pending.length; value2++) {
              if (value.number === pending[value2]) {
                if (cred > 0) {
                  cred -= 3;
                } else {
                  delete pending[value2];
                  creditsTaken += 3;
                }
              }
            }
          });
        }
      }
      const b = student.minOneCourseInEachSubArea as SubArea[]; // check if at least one course from each subarea is completed
      for (let index = 0; index < b.length; index++) {
        let p = 0;
        let c = 0;
        let subArea = false;
        const x = b[index]?.courses;
        if (x) {
          Object.values(x).forEach((value) => {
            Object.values(pending).forEach((value2) => {
              if (value.number === value2 && subArea === false) {
                subArea = true;
                p += 1;
              }
            });
            Object.values(pending).forEach((value2) => {
              if (value.number === value2 && subArea === false) {
                subArea = true;
                c += 1;
              }
            });
          });
        }
        if (subArea === false) {
          unsatisfied += 1;
        }
        satisfied += c;
        numPending += p;
      }

      const c = student.minTwoCourseInEachSubArea as SubArea[]; // check if at least one course from each subarea is completed
      for (let index = 0; index < b.length; index++) {
        let p = 0;
        let c = 0;
        let subArea = 0;
        const x = b[index]?.courses;
        if (x) {
          Object.values(x).forEach((value) => {
            Object.values(pending).forEach((value2) => {
              if (value.number === value2 && subArea < 2) {
                subArea += 1;
                p += 1;
              }
            });
            Object.values(pending).forEach((value2) => {
              if (value.number === value2 && subArea < 2) {
                subArea += 1;
                c += 1;
              }
            });
          });
        }
        if (subArea < 2) {
          unsatisfied += 2 - subArea;
        }
        satisfied += c;
        numPending += p;
      }
      // take out unapplicable courses
      const unapplicable = student.minRegularLectureCourses?.notCountedCourses;
      for (let value = 0; value < pending.length; value++) {
        if (unapplicable) {
          for (let value2 = 0; value2 < unapplicable.length; value2++) {
            const co = unapplicable[value2]?.number;
            if (co) {
              if (co === pending[value]) {
                delete pending[value];
              }
            }
          }
        }
      }
      for (let value = 0; value < completed.length; value++) {
        if (unapplicable) {
          for (let value2 = 0; value2 < unapplicable.length; value2++) {
            const co = unapplicable[value2]?.number;
            if (co) {
              if (co === completed[value]) {
                delete completed[value];
              }
            }
          }
        }
      }
      const creditsNeeded = student.totalCredits;
      if (creditsNeeded) { // check credits requriement
        if (creditsTaken >= creditsNeeded) {
          satisfied += 1;
        } else {
          unsatisfied += (creditsNeeded - creditsTaken) / 3;
        }
      }
    }
  }

  reqStatus = [satisfied, numPending, unsatisfied];

  return reqStatus;
}
