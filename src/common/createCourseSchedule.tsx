// need to consider multiple semester
// need to consider fall/spring
// need precise time for each class
// need to add the thingy from degree requirement to add classes
// need to account for preferred classes
// need to check when degree is actuall completed
// need to output it into the website
//
// to run, "tsc src\common\createCourseSchedule.tsx"
// then    "node src\common\createCourseSchedule.js "<--- (js)

class classes {
    name: string;

    startTime: Date;

    endTime: Date;

    credits: number;

    requirements: classes[] = [];

    elective: boolean;

    constructor(name: string, credits: number, elective: boolean, startTime: Date, endTime: Date) {
      this.name = name;
      this.credits = credits;
      this.startTime = startTime;
      this.endTime = endTime;
      this.elective = elective;
    }

    getStartTime() {
      return this.startTime;
    }

    toString() {
      return this.name;
    }

    addRequirements(requirement: classes) {
      this.requirements.push(requirement);
    }

    getRequirements() {
      return this.requirements;
    }

    // was bugged, now fixed?
    metRequirement(currentClass: classes, remainingClasses: classes[]) {
      // what does this do?
      // uh, check if class mets requirement to graduate, and that means checking
      // if any of the requirement classes in the array still exist in the remaining classes
      // if not, that good, if there are classes still remaining, then not good.
      for (const requiredClasses of this.requirements) {
        if (remainingClasses.indexOf(requiredClasses) > -1) {
          return false;
        }
      }
      return true;
    }
}

class semesterSchedule {
    MonWedFri: classes[] = [];

    TuTH: classes[] = [];

    MonWedFriTime: Date = new Date(0, 0, 0, 0, 0);

    TuTHTime: Date = new Date(0, 0, 0, 0, 0);

    constructor() { }

    // appends a class to the schedule
    addClass(addClass: classes, mwf: boolean, availableClasses: availableClasses) {
      if (mwf) {
        this.MonWedFri.push(addClass);
        this.MonWedFriTime = addClass.endTime;
        availableClasses.removeClass(addClass);
      } else {
        this.TuTH.push(addClass);
        this.TuTHTime = addClass.endTime;
      }
    }

    to_string(): string {
      const temp = this.MonWedFri.toString() + this.TuTH.toString();
      return temp;
    }

    nextAvailableTimeSlot(mwf: boolean) {
      if (mwf) {
        return this.MonWedFriTime;
      }

      return this.TuTHTime;
    }
}

// class student would like to take
class preferredClasses {
    preferredClasses: classes[] = [];

    constructor() { }

    addClass(classes: classes) {
      this.preferredClasses.push(classes);
    }

    removeClass(classes: classes) {
      const index = this.preferredClasses.indexOf(classes);
      if (index > -1) {
        this.preferredClasses.splice(index, 1);
      }
    }
}

// all classes the student can take that counts toward degree completion
class availableClasses {
    availableClasses: classes[];

    constructor(classes: classes[]) {
      this.availableClasses = classes;
    }

    // removes classes that does not fit in schedule
    filterByTime() { }

    removeClass(classes: classes) {
      const index = this.availableClasses.indexOf(classes, 0);
      if (index > -1) {
        this.availableClasses.splice(index, 1);
      }
    }

    earliestTimeMatch(endTime: Date) { // endtime is the time the class ends
      let temp = new Date(0, 0, 23, 59);
      let tempClass;
      const test = new Date(0, 0, 11, 23);
      // console.log("Earliest Time Match");
      // console.log("the end time is "+endTime.toLocaleTimeString());
      for (const avaClass of this.availableClasses) {
        if (avaClass.startTime < temp && avaClass.startTime > endTime) {
          if (avaClass.metRequirement(avaClass, this.availableClasses)) {
            temp = avaClass.startTime;
            tempClass = avaClass;
          } else {
          }
        }
      }
      return tempClass;
    }
}

// requirement for student
class majorRequirement {
    listedCourse: classes[]; // mandatory courses

    // need to expand on this for multiple named course, but you can pick which one you can take
    electives: number; // number of elective needed

    electiveCredit: number; // number of elective credit needed

    constructor(listedCourse: classes[], electives: number, electiveCredit: number) {
      this.listedCourse = listedCourse;
      this.electives = electives;
      this.electiveCredit = electiveCredit;
    }

    // change major requirement based on classes taken
    degreeProgress(classesTaken: classes) {
      if (classesTaken.elective) {
        this.electives--;
        this.electiveCredit--;
      } else {
        const index = this.listedCourse.indexOf(classesTaken, 0);
        if (index > -1) {
          this.listedCourse.splice(index, 1);
        }
      }
    }

    isComplete() {
      if (this.electiveCredit <= 0 && this.listedCourse.length == 0) {
        return true;
      }

      return false;
    }
}

// iterate from availble classes, take those that fit the requirement and is mandatory
// take the earliest
// repeat until full
// if not full, take the earlier available elective
// repeat until credit limit is hit

// do it for one semester, 18 credits, 1 elective, with 4 credits
// rest are 5 3 credit classes,
// ams 101 ams 102 ams 103
// cse 101 cse 102
// ele 101
// schdule should be ams 101, cse 101, ele 101
// and thats it

function generateSchedule() {
  const ams101 = new classes('AMS101', 3, false, new Date(0, 0, 0, 8, 45), new Date(0, 0, 0, 9, 15)); // datetime might be fucked
  const ams102 = new classes('AMS102', 3, false, new Date(0, 0, 0, 10, 45), new Date(0, 0, 0, 11, 15));
  const ams103 = new classes('AMS103', 3, false, new Date(0, 0, 0, 10, 45), new Date(0, 0, 0, 11, 15));
  ams102.addRequirements(ams101);
  ams103.addRequirements(ams102);
  const cse101 = new classes('CSE101', 3, false, new Date(0, 0, 0, 12, 15), new Date(0, 0, 0, 13, 30));
  const cse102 = new classes('CSE102', 3, false, new Date(0, 0, 0, 14, 30), new Date(0, 0, 0, 15, 30));
  cse102.addRequirements(cse101);
  const ele101 = new classes('ELE101', 3, true, new Date(0, 0, 1, 17, 15), new Date(0, 0, 0, 18, 15));

  const allClass: classes[] = [ele101, ams102, ams103, cse101, cse102, ams101];

  const AvailableClasses = new availableClasses(allClass);
  const requirement = new majorRequirement([ams102, ams101, cse101, cse102], 1, 3);
  const semester1 = new semesterSchedule();

  // fill out the schedule

  let endTime = new Date(0, 0, 0, 0, 0);
  const filled = true;
  let tempClass: classes;
  const schedule:classes[] = [];
  while (true) {
    tempClass = AvailableClasses.earliestTimeMatch(endTime); // get the first class
    if (tempClass == undefined) {
      break; // fail to find any classes
    }
    endTime = tempClass.endTime;
    AvailableClasses.removeClass(tempClass); // remove it from list of class can be taken
    schedule.push(tempClass);
    requirement.degreeProgress(tempClass);
    if (requirement.isComplete()) break;
  }
  printSchedule(schedule);
}
function printSchedule(schedule:classes[]) {
  const mwf = new Date(0, 0, 0, 0, 0);
  const tuth = new Date(0, 0, 1, 0, 0);
  console.log('Monday');
  for (const thisClass of schedule) {
    if (thisClass.startTime.getDate() == tuth.getDate()) {
      console.log('');
      console.log('Tuesday');
      tuth.setDate(2);
    }
    console.log(`${thisClass.name} ${thisClass.credits} ${thisClass.startTime.getHours()}:${thisClass.startTime.getMinutes()
    }-${thisClass.endTime.getHours()}:${thisClass.endTime.getMinutes()}`);
  }
}
generateSchedule();
