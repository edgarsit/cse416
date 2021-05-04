import type { Course } from '../model/course';
import type { Student } from '../model/user';
import { CoursePlanModel, DegreeRequirementsModel } from '../server/models';

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

// not sure what to do about time limit
// More conditionals are needed to separate courses taken in past semesters and
// those taken in the current
// as well as which index gets updated in reqstatus
function requirementStatus(s: Student) {
  const reqStatus: [number, number, number] = [0, 0, 0];// satisfied,pending,unsatisfied
  const coursePlans = CoursePlanModel.find({ sbuId: s.sbuId });
  const degree = DegreeRequirementsModel.find({ requirementVersion: `${s.entrySemester} ${s.entryYear}` });
  // each department has different requirements so the counts are determined
  // based on what the department of the student is
  switch (s.department) {
    case 'AMS': {
      /*

            if finalRecommendation is true
            {
                reqStatus[0]+=1
            }
            else
            {
                reqStatus[2]+=1
            }

            let creditsNeeded=track.totalCredits
            let coursesTaken=0
            let coreCoursesTaken=0
            let cumulativeGPA=0
            let coreCourseGPA=0
            let xCreditsGradeY=0//variable to keep track of the amount of credits with grade Y

            Get track of student
            let unsatisfiedCoursesNum=core courses in track + numCourses in elective
            let numElectives=track.elective.numCourses
            //create variable/array, tempName, to keep track of x courses in range,
            // maybe this can be simplified if not gonna be tested during demo
            for every string in additionalCoreCourseRequirements
            {
                unsatisfiedCoursesNum+= +string[0]//the integer value realistically wouldnt be over 9.
                //In case we want to deal with that case regardless, split the string by whitespace
                //and use the integer value for the first element in the split string array

                //update the variable/array tempName with string parsed into x and range
            }

            taken_credits=0 //update these two variables to keep track of credit requirement
            pending_credits=0 //credits for courses taken in current semester. above variable is for past course credits

            For every course in courseplan
            {
                if course is in track.coreCourses
                {
                    reqStatus[0]+=1
                    unsatisfiedCourseNum-=1
                }
                else
                {
                    let coreCourse=False
                    for e in tempName  //once again this might be overboard and could probably be simplified to just the hard coded case in the file
                    {
                        if e[0]>0 && isCourseInRange(course,e[1])
                        {
                            reqStatus[0]+=1
                            unsatisfiedCourseNum-=1
                            e[0]-=1
                            coreCourse=True
                        }
                    }
                    if(!coreCourse && numElectives>0)
                    {
                        if track.elective.range is not empty
                        {
                            if(isCourseInRange(course,track.elective.range))
                            {
                                reqStatus[0]+=1
                                unsatisfiedCourseNum-=1
                                numElectives-=1
                            }
                            else
                            {
                                for substitution in track.substitutions
                                {
                                    parse substitution string into a tuple (x,range), tempName2, where x is num courses in range
                                    for e in tempName2
                                    {
                                        if e[0]>0 && isCourseInRange(course,e[1])
                                        {
                                            reqStatus[0]+=1
                                            unsatisfiedCourseNum-=1
                                            e[0]-=1
                                            coreCourse=True
                                        }
                                    }
                                }
                            }
                        }
                        else
                        {
                            //i think if this case is reached, the course is considered an elective course
                            //and reqStatus,unsatisfiedCourseNum, and numElectives get updated
                        }
                    }
                }
                if course was taken in the past, taken_credits+= credit value of course
                else if course is taken now, pending credits+= credit value of course

                if course.grade== track.xCreditsGradeY.Grade
                {
                    xCreditsGradeY+=credit value of course
                }

                 handle grade calculations for courses taken. would be something along the lines of the follwing
                lines but put into areas above where the course is taken during the current semester
                    numCourses+=1
                    cumulativeGPA+=course.grade
                same would apply for coreCourseGPA, but only for core courses
            }
            reqStatus[2]+=unsatisfiedCoursesNum
            cumulativeGPA=cumulativeGPA/numCourses
            coreCourseGPA=coreCourseGPA/coreCoursesTaken

            if cumulativeGPA and coreCOurseGPA and xCreditsGradeY are at least the values in the degree requirement
            {
                reqStatus[0]+=1
            }
            else
            {
                reqStatus[2]+=1
            }

            if taken_credits>= track.totalCredits
            {
                reqStatus[0]+=1
            }
            elseif taken_credits+pending_credits>=track.totalCredits
            {
                reqStatus[0]+=1
            }
            else
            {
                reqStatus[2]+=1
            }
            return reqStatus
            */
      break;
    }
    case 'BMI': { // I think foreign language can be ignored
      /*
           //One thing not written here is handling the case where a student is checked to see if they are full
           //time and if they are taking the fullTImeRequiredCourse in the degree requirement

            if finalRecommendation is true
            {
                reqStatus[0]+=1
            }
            else
            {
                reqStatus[2]+=1
            }

            let creditsNeeded=track.totalCredits
            taken_credits=0 //update these two variables to keep track of credit requirement
            pending_credits=0 //credits for courses taken in current semester. above variable is for past course credits
            let coursesTaken=0
            let cumulativeGPA=0
            let creditsinCombinationY=0//variable to keep track of the amount of credits with courses in this field
            //If the value goes over the vlaue in the degree requirement, the credits over that value should be subtracted from
            //taken or pending credit variables, might not have the time to deal with that specific case so maybe it can be ignored
            let totalCreditsForCourses=0//same as the previous variable but for maxTotalCreditsForCourses in the degree

            Get track of student
            let unsatisfiedCoursesNum=requiredCourses+num courses in sequence (3 with degree requirement1 file)+
                core courses in track + num courses in electiveCourses

            For every course in courseplan
            {
                if course is in requiredCourses
                {
                    reqStatus[0]+=1
                    unsatisfiedCourseNum-=1
                    //update credit and grade related variables
                }
                else
                {
                    if course in track.sequence
                    {
                        if the course is 502 or 503 and the other has been taken {continue;}//essentially ignore the course, except for maybe grade handling
                        reqStatus[0]+=1
                        unsatisfiedCourseNum-=1
                        //update credit and grade related variables
                    }
                    else
                    {
                        if course is in track.electiveCourses
                        {
                            reqStatus[0]+=1
                            unsatisfiedCourseNum-=1
                            //update credit and grade related variables
                        }
                    }
                }
            }
            reqStatus[2]+=unsatisfiedCoursesNum
            cumulativeGPA=cumulativeGPA/numCourses

            if cumulativeGPA at least the values in the degree requirement
            {
                reqStatus[0]+=1
            }
            else
            {
                reqStatus[2]+=1
            }

            if taken_credits>= track.totalCredits
            {
                reqStatus[0]+=1
            }
            elseif taken_credits+pending_credits>=track.totalCredits
            {
                reqStatus[1]+=1
            }
            else
            {
                reqStatus[2]+=1
            }
            return reqStatus
            */
      break;
    }
    case 'CSE': {
/*
        if finalRecommendation is true
        {
            reqStatus[0]+=1
        }
        else
        {
            reqStatus[2]+=1
        }

        let creditsNeeded=track.totalCredits
        taken_credits=0 //update these two variables to keep track of credit requirement
        pending_credits=0 //credits for courses taken in current semester. above variable is for past course credits
        let coursesTaken=0
        let cumulativeGPA=0

        let theoryBreadthTaken=False
        let systemsBreadthTaken=False
        let informationSystemsBreadthTaken=False

        Get student track
        let unsatisfiedCoursesNum=core courses in track + track.additionalCourses
        let numElectives=track.additionalCourses
        let additionalRequirementCredits=0 //if this is more than the max vlaue in the degree doc, subtract
        //credits by difference
        cse587credits=0

        for course in coursePlan
        {
            //if the course is cse587, add credit amount to cse587credits. If it's above max_credits
            //subtract the difference from total credits

            //check if the course falls is in any of the three breadths, if it is, change the variable associated
            //to it to true
            if course is in track.coreCourses
            {
                reqStatus[0]+=1
                unsatisfiedCourseNum-=1
                //handle grade and credit calculation
            }
            else
            {
                if course not in unapplicable_courses_for_credits
                {
                    if track.additionalRequirement is not empty
                    {
                        if course in track.additionalRequirement.courses ||
                            (course.num >= 600 && track.additionalRequirement.sixHundredCourses=="True")
                        {
                            let additionalRequirementCredits+=course credit value
                            reqStatus[0]+=1
                            unsatisfiedCourseNum-=1
                            //handle grade and credit calculation
                        }
                        else
                        {
                            reqStatus[0]+=1
                            unsatisfiedCourseNum-=1
                            //handle grade and credit calculation
                        }
                    }
                }
            }
        }
        if !theoryBreadthTaken { reqStatus[2]+=1}
        if !systemsBreadthTaken { reqStatus[2]+=1}
        if !informationSystemsBreadthTake { reqStatus[2]+=1}

        if cumulativeGPA at least the value in the degree requirement
        {
            reqStatus[0]+=1
        }
        else
        {
            reqStatus[2]+=1
        }

        let min = min value for additionalRequirementCredits in track
        if taken_credits>= track.totalCredits && additionalRequirementCredits<min
        {
            reqStatus[0]+=1
        }
        elseif taken_credits+pending_credits>=track.totalCredits && additionalRequirementCredits<min
        {
            reqStatus[1]+=1
        }
        else
        {
            reqStatus[2]+=1
        }
	reqStatus[2]+=unsatisfiedCoursesNum
	return reqStatus

*/
      break;
    }
    case 'ECE': {
/*
            let creditsNeeded=track.totalCredits
            taken_credits=0 //update these two variables to keep track of credit requirement
            pending_credits=0 //credits for courses taken in current semester. above variable is for past course credits
            let coursesTaken=0
            let cumulativeGPA=0

            let hardwareSubAreaTaken=False
            let networkSubAreaTaken=False
            let cadAndVLSISubAreaTaken=False

            let numTheoryAndSoftwareSubAreaNeeded=2 //this requirement is complete when this is 0

            Get student track
            let unsatisfiedCoursesNum=6 + track.minLectureBasedCourses.numCourses//6 from subarea courses and required course
            let numElectives=track.additionalCourses

            let thesisTaken=False//only checked if student is on thesis track
            let requiredCourseTaken=False
            let numLecturesTaken=0
            let cse670Counted=False

            For course in coursePlan
            { //handle all grade and credit calculation for each one
                if course in hardware and hardwareSubAreaTaken==False
                {
                    reqStatus[0]+=1
                    unsatisfiedCourseNum-=1
                    hardwareSubAreaTaken=True
                }
                elseif course in network and networkSubAreaTaken==False
                {
                    reqStatus[0]+=1
                    unsatisfiedCourseNum-=1
                    networkSubAreaTaken=True
                }
                elseif course in cadAndVLSI and cadAndVLSISubAreaTaken==False
                {
                    reqStatus[0]+=1
                    unsatisfiedCourseNum-=1
                    cadAndVLSISubAreaTaken=True
                }
                elseif course in numTheoryAndSoftware and numTheoryAndSoftwareSubAreaTaken>0
                {
                    reqStatus[0]+=1
                    unsatisfiedCourseNum-=1
                    cadAndVLSISubAreaTaken-=1
                }
                elseif (course in requiredCreditsOfCourseX or requiredCreditsOfCourseX.substirutionsWithApproval) and requiredCourseTaken==False
                {
                    reqStatus[0]+=1
                    unsatisfiedCourseNum-=1
                    requiredCourseTaken=True
                }
                else if track.thesisRequired==True and course is ESE 599
                {
                    reqStatus[0]+=1
                    thesisTaken=True
                }
                elseif course not in minRegularLectureBasedCourses.notCountedCourses and numLecturesTaken<minRegularLectureBasedCourses.numCourses
                {
                    if course.num is 670 and cse670Taken==False
                    {
                        reqStatus[0]+=1
                        unsatisfiedCourseNum-=1
                        numLecturesTaken+=1
                        cse670Taken=True
                    }
                    else if course.num is not 670
                    {
                        reqStatus[0]+=1
                        unsatisfiedCourseNum-=1
                        numLecturesTaken+=1
                    }
                }
            }
            reqStatus[2]+=unsatisfiedCoursesNum
            if track.thesisRequired==True and thesisTaken==False
            {
                reqStatus[2]+=1
            }
            if cumulativeGPA at least the value in the degree requirement
            {
                reqStatus[0]+=1
            }
            else
            {
                reqStatus[2]+=1
            }


            //the following lines need additional conditions to deal with maxCreditsInCombinationY,xCreditsForCourseY,maxCreditsForCourseY (the right two can just be
            //dealt as the same) but im not sure how to incorporate that into the psuedocode
            if taken_credits>= track.totalCredits
            {
                reqStatus[0]+=1
            }
            elseif taken_credits+pending_credits>=track.totalCredits
            {
                reqStatus[1]+=1
            }
            else
            {
                reqStatus[2]+=1
            }
            return reqStatus
*/
      break;
    }
    default: {
      // maybe throw an error or return reqStatus as is or (-1,-1,-1)
      break;
    }
  }
}

function isCourseInRange(c: Course, r: string) {
  const dep = r.substr(0, 3);
  const min: number = +r.substr(4, 3);// lower bound for range
  const max: number = +r.substr(8, 9);// upper bound for range
  return (c.department === dep && c.number >= min && c.number <= max);
}
