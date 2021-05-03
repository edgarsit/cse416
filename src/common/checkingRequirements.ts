import { Course } from "../model/course";
import { Student } from "../model/user";
import { CoursePlanModel, DegreeRequirementsModel } from "../server/models";

/*
for the summary information, requirements are counted as follows.  
for requirements involving core (mandatory) and elective courses are counted, 
each such course is counted as a separate requirement, to provide more fine-grained measurement of progress.  
for example, if a student needs to take 5 core courses and 4 electives, 
there are 9 requirements to be satisfied.  a project or thesis counts as 1 requirement, 
even if it is satisfied by taking multiple courses, e.g., 
CSE advanced project requirement is satisfied by taking CSE 523 and CSE 524, 
and the BMI/CSE/ESE thesis requirement is satisfied by taking at least 6 credits of BMI/CSE/ESE 599, 
which is usually (though not necessarily) done by taking that course twice for 3 credits each.  
GPA requirement counts as 1 requirement, even if it is multi-faceted, e.g., 
even if it imposes minimums on both cumulative GPA and departmental GPA. number-of-credits requirement counts as 1 requirement.
*/

//not sure what to do about time limit
function requirementStatus (s: Student){
    let reqStatus: [number, number, number] = [0, 0, 0];//satisfied,pending,unsatisfied
    let coursePlans=CoursePlanModel.find({sbuId : s.sbuId})
    let degree=DegreeRequirementsModel.find(requirementVersion:s.entrySemester+" "+s.entryYear)
    switch(s.department) { //each department has different requirements so the counts are determined based on what the department of the student is
        case "AMS": { 
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
            //create variable/array, tempName, to keep track of x courses in range, maybe this can be simplified if not gonna be tested during demo
            for every string in additionalCoreCourseRequirements
            {
                unsatisfiedCoursesNum+= +string[0]//the integer value realistically wouldnt be over 9. In 
                //case we want to deal with that case regardless, split the string by whitespace
                //and use the integer value for the first element in the split string array

                //update the variable/array tempName with string parsed into x and range
            }

            taken_credits=0 //update these two variables to keep track of credit requirement
            pending_credits=0 //credits for courses taken in current semester. above variable is for past course credits

            For every course in courseplan
            {
                if course is in track.coreCourses
                {
                    //not sure if more conditionals are needed to separate changes by the semester in courseplan
                    //this also applies to the other cases as well
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
        case "BMI": { 
           
           break; 
        } 
        case "CSE": { 
           
           break; 
        } 
        case "ECE": { 
            
           break; 
        } 
        default: { 
           //maybe throw an error or return reqStatus as is or (-1,-1,-1)
           break; 
        } 
     } 
}

function isCourseInRange (c: Course, r: string){
    let dep=r.substr(0,3)
    let min: number=+r.substr(4,3)//lower bound for range
    let max: number=+r.substr(8,9)//upper bound for range
    return (c.department==dep && c.number>=min && c.number<=max)
}

