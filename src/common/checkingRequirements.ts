import type { Student } from '../model/user';
import type { Course, CoursePlan } from '../model/course';
import { CoursePlanModel, DegreeRequirementsModel } from '../server/models';
import { SubArea } from '../model/degreeRequirements';

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
  const degree = await DegreeRequirementsModel.findOne({ requirementVersion: `${s.requirementVersionSemester} ${s.requirementVersionYear}`, degreeName: s.department });
  if (degree?.degreeName === 'Computer Science') {
    let completed: Array<number> = [];
    let pending: Array<number> = [];
    let grades: Array<number> = [];
    for(let value of coursePlans){
      if(value.department === 'CSE'){
        if(value.grade === 0){
        pending.push(value.courseNum);
        }else{
          completed.push(value.courseNum);
          if(value.grade)
          grades.push(value.grade);
        }
      }
    }
    let b = degree.breaths as SubArea[]; //check if at least one course from each subarea is completed
    for (let index = 0; index < b.length; index++){
      let subArea = false;
      let x = b[index]?.courses;
      if(x != undefined){
      for(let value of x){
        for(let value2 of pending){
          if(value.number == value2 && subArea == false){
            subArea = true;
            numPending += 1;
          }         
        }
        for(let value2 of completed){
          if(value.number == value2 && subArea == false){
            subArea = true;
            satisfied += 1;
          }         
        }
      }
      }
      if(subArea == false){
        unsatisfied += 1;
    }
    }
    const studentTrack = s.track;
    let trackNum = -1;
    for (let index = 0; index < degree.tracks.length; index++){
      if (degree[index].name = studentTrack){
          trackNum = index
      }
    }
    let temp1 = 0;
    for(let value = 0; value < pending.length; value++){  //if thesis isued for more than 9 credits remove it
      if(pending[value] == 599){
        temp1+1;
        if(temp1 >= 3){
          delete pending[value];
        }
      }
    }
    let temp2 = 0;
    for(let value = 0; value < completed.length; value++){  //if thesis isued for more than 9 credits remove it
      if(completed[value] == 599){
        temp2+1;
        if((temp1 + temp2) >= 3){
          delete completed[value];
        }
      }
    }
      //thesis requirement
    if(degree.tracks[trackNum]?.thesisRequired){
      if(temp2 >= 3){
        satisfied += 1; 
      }else if((temp1+temp2) >= 3){
        numPending+=1;
      } else{
        unsatisfied+=1;
      }
    }

    let creditsNeeded = degree.tracks[trackNum]?.totalCredits;


    let grade = 0;
    for(let value of grades){
      grade += value;  
    }
    grade = grade/grades.length;            // check grade reqirement
    if(grade >= +degree.minimumCumulativeGPA){
      satisfied +=1;
    }else{
      unsatisfied +=1;
    }           

    let core = degree.tracks[trackNum]?.coreCourses;  
    if(core){                         // check number of core courses
    let numCore = core.length;
    for(let value of core){
      for(let value2 = 0; value2 < pending.length; value2++){
           if(value.number == pending[value2]){
             delete pending[value2];
             numPending += 1;
             numCore -= 1;
             break;
           }
        }
      for(let value2 = 0; value2 < completed.length; value2++){
          if(value.number == completed[value2]){
            delete completed[value2];
            numPending += 1;
            numCore -= 1;
            break;
          }
       }
      }
      unsatisfied += numCore;   
    }
    //take out unapplicable courses
    let unapplicable = degree.tracks[trackNum]?.unapplicableCoursesCredits;
    for(let value = 0; value < pending.length; value++){ 
      if(unapplicable)
      for(let value2 = 0; value2 < unapplicable.length; value2++){
        let co = unapplicable[value2]?.number;
        if(co)
        if(co == pending[value]){
          delete pending[value];
        }
      }
    }
    for(let value = 0; value < completed.length; value++){ 
      if(unapplicable)
      for(let value2 = 0; value2 < unapplicable.length; value2++){
        let co = unapplicable[value2]?.number;
        if(co)
        if(co == completed[value]){
          delete completed[value];
        }
      }
    }
    for(let value = 0; value < completed.length; value++){  //if thesis isued for more than 9 credits remove it
      if(completed[value] == 599){
      }
    }
    let additional = degree.tracks[trackNum]?.additionalCourses; 
    let add = 0;
    if(degree.tracks[trackNum]?.additionalRequirement.courses){ //handle additional requirement
      for(let value = 0; value < degree.tracks[trackNum]?.additionalRequirement.courses.length; value++){ 
        let co =degree.tracks[trackNum]?.additionalRequirement.courses[value] as Course;
        for(let value2 = 0; value < completed.length; value2++){
          if(co.number == completed[value2]){
            add += 1;
          }
          if(completed[value2] as number >= 600 && degree.tracks[trackNum]?.additionalRequirement.sixHundredCourses == true){
            add+=1;
          }

          for(let value2 = 0; value < completed.length; value2++){
            if(co.number == completed[value2]){
              add += 1;
              if((add*3) > degree.tracks[trackNum]?.additionalRequirement.maxCredits){
                delete completed[value2];
              }
            }
            if(completed[value2] as number >= 600 && degree.tracks[trackNum]?.additionalRequirement.sixHundredCourses == true){
              add+=1;
              if((add*3) > degree.tracks[trackNum]?.additionalRequirement.maxCredits){
                delete completed[value2];
              }
            }

        }
        for(let value2 = 0; value < pending.length; value2++){
          if(co.number == pending[value2]){
            add += 1;
            if((add*3) > degree.tracks[trackNum]?.additionalRequirement.maxCredits){
              delete pending[value2];
            }
          }
          if(pending[value2] as number >= 600 && degree.tracks[trackNum]?.additionalRequirement.sixHundredCourses == true){
            add+=1;
            if((add*3) > degree.tracks[trackNum]?.additionalRequirement.maxCredits){
              delete pending[value2];
            }
          }

      }
          
    }
  
    }
    let creditsTaken = 0;
    creditsTaken += (pending.length * 3);
    creditsTaken += (completed.length * 3);
    if(creditsNeeded){                  //check credits requriement
    if(creditsTaken >= creditsNeeded){
      satisfied +=1;
    }else{
      numPending +=1;
    }
  }
  let temp = degree.tracks[trackNum]?.additionalCourses
  if(temp){
  if(completed.length >= temp){
    satisfied += temp
  }else if ((pending.length + completed.length) >= temp) {
    satisfied += completed.length;
    numPending += (temp - completed.length);
  }else{
    satisfied += completed.length;
    numPending += pending.length;
    unsatisfied += (temp - (pending.length + completed.length))

  }
}
    }
    reqStatus = [satisfied,numPending, unsatisfied];
}


  return reqStatus;
}
