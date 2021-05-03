import { Course } from './course';
import { prop, rprop } from './util';

// Short name cuz no time
const id = <T>(x: T): T => x;
const cc = (s: string): Course => {
  const [department, number] = s.split(/\s+/);
  return { department: department!, number: +number! };
};

const c = (v) => prop({
  ...v,
  set(ss: string[] | string): Course[] | Course {
    return Array.isArray(ss) ? ss.map(cc) : cc(ss);
  },
  get(s) {
    return s;
  },
});

export class XCreditsForCourseY {
  @rprop()
  public credits!: number

  @c({ type: () => Course })
  public course?: Course
}

export class MaxCreditsForCourseY {
  @rprop()
  public credits!: number

  @c({ type: () => [Course] })
  public courses?: Course[]
}

export class XCreditsGradeY {
  @rprop()
  public credits!: number

  @rprop()
  public courses!: Course
}

export class MaxCreditsForGradeY {
  @rprop()
  public credits!: number

  @rprop()
  public grade!: string
}

export class CSE587Info {
  @rprop()
  public maxCredits!: number

  @rprop()
  public maxClasses!: number
}

export class RegularLectureBasedCourses {
  @rprop()
  public minCourses!: number

  @c({ type: () => [Course] })
  public notCountedCourses?: Course[]

  @c({ type: () => [Course] })
  public courawaOnlyOnce?: Course[]
}

export class RequiredCreditsOfCourseX {
  @rprop()
  public minCredits!: number

  @rprop()
  public maxCredits!: number

  @c({ type: () => [Course] })
  public substitutionsWithApproval?: Course[]
}

export class SubArea {
  @rprop()
  public subArea!: string

  @c({ type: () => [Course] })
  public courses?: Course[]
}

export class DegreeRequirements {
  @rprop()
  public degreeName!: string

  @rprop()
  public requirementVersion!: string

  @rprop()
  public minimumCumulativeGPA!: string

  @prop()
  public timeLimit?: string

  @prop({ map: ['Required', 'Not-Required'], get: id, set: (x) => ['Required', 'Not-Required'].indexOf(x) })
  public finalRecommendation?: boolean

  @prop({ map: ['True', 'False'], get: id, set: (x) => ['True', 'False'].indexOf(x) })
  public registrationRequired!: boolean

  @prop({ map: ['True', 'False'], get: id, set: (x) => ['True', 'False'].indexOf(x) })
  public foreignLanguageRequired?: boolean

  @c({ type: () => Course })
  public fullTimeCourseRequirement?: Course

  @c({ type: () => [Course] })
  public coreCourses?: Course[]

  @prop({ ref: () => XCreditsGradeY })
  public prerequisites?: XCreditsGradeY

  @prop({ type: () => XCreditsForCourseY })
  public maxCreditsInCombinationY?: XCreditsForCourseY[]

  @prop({ type: () => XCreditsForCourseY })
  public maxTotalCreditsForCourses?: XCreditsForCourseY[]

  @prop({ type: () => CSE587Info })
  public cse587Info?: CSE587Info

  @prop({ type: () => [SubArea] })
  public breaths?: SubArea[]

  @rprop({ type: () => [Tracks] })
  public tracks!: Tracks[]
}

export class Elective {
  @rprop()
  public numCourses!: number

  @rprop()
  public totalCredits!: number

  @prop()
  public range?: string

  @rprop({ type: () => [[String]] })
  public substitutions!: string[][]
}

export class Tracks {
  @rprop()
  public name!: string

  @rprop()
  public totalCredits!: number

  @prop({ map: ['True', 'False'], get: id, set: (x) => ['True', 'False'].indexOf(x) })
  public thesisRequired?: boolean

  @rprop({ type: () => XCreditsForCourseY })
  public xCreditsForCourseY!: XCreditsForCourseY[]

  @prop({ type: () => XCreditsForCourseY })
  public maxCreditsInCombinationY?: XCreditsForCourseY[]

  @prop({ type: () => MaxCreditsForCourseY })
  public maxCreditsForCourseY?: MaxCreditsForCourseY

  @c({ type: () => [Course] })
  public sequence?: Course[]

  @c({ type: () => [Course] })
  public coreCourses?: Course[]

  @c({ type: () => [Course] })
  public electiveCourses?: Course[]

  @c({ type: () => [Course] })
  public unapplicableCoursesCredits?: Course[]

  @prop({ type: () => [SubArea] })
  public minOneCourseInEachSubArea?: [SubArea]

  @prop({ type: () => [SubArea] })
  public minTwoCourseInEachSubArea?: [SubArea]

  @prop({ type: () => RegularLectureBasedCourses })
  public minRegularLectureCourses?: RegularLectureBasedCourses

  @prop({ type: () => RequiredCreditsOfCourseX })
  public requiredCreditsOfCourseX?: RequiredCreditsOfCourseX

  @prop({ type: () => Elective })
  public elective?: Elective
}
