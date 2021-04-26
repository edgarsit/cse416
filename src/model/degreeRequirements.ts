import { Course } from './course';
import { prop, rprop } from './util';

// Short name cuz no time
const id = <T>(x: T): T => x;
const cc = (s: string): Course => {
  const [department, courseNum] = s.split(/\s+/);
  return { department: department!, courseNum: courseNum! };
};

const c = (v) => rprop({
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

  @rprop()
  public course!: string
}

export class MaxCreditsForCourseY {
  @rprop()
  public credits!: number

  @c({ type: () => [Course] })
  public courses!: Course[]
}

export class XCreditsGradeY {
  @rprop()
  public credits!: number

  @rprop()
  public courses!: string
}

export class MaxCreditsForGradeY {
  @rprop()
  public credits!: number

  @rprop()
  public grade!: string
}

export class minCourcesSubArea {
  @rprop()
  public minCourses!: number

  @rprop({ type: () => [SubArea] })
  public subArea!: SubArea[]
}

export class RegularLectureBasedCourses {
  @rprop()
  public minCourses!: number

  @c({ type: () => [Course] })
  public notCountedCourses!: Course[]

  @c({ type: () => [Course] })
  public courawaOnlyOnce!: Course[]
}

export class RequiredCreditsOfCourseX {
  @rprop()
  public minCredits!: number

  @rprop()
  public maxCredits!: number

  @c({ type: () => [Course] })
  public substitutionsWithApproval!: Course[]
}

export class SubArea {
  @rprop()
  public name!: string

  @c({ type: () => [Course] })
  public courses!: Course[]
}

export class DegreeRequirements {
  @rprop()
  public degreeName!: string

  @rprop()
  public requirementVersion!: string

  @rprop()
  public minimumCumulativeGPA!: string

  @rprop()
  public timeLimit!: string

  @rprop({ map: ['Required', 'Not-Required'], get: id, set: (x) => ['Required', 'Not-Required'].indexOf(x) })
  public finalRecommendation!: boolean

  @prop()
  public creditsNeededToGraduate?: number

  @prop({ ref: () => XCreditsGradeY })
  public prerequisites?: XCreditsGradeY

  @c({ type: () => [Course] })
  public coreCourses!: Course[]

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

  @prop({ map: ['False', 'True'] })
  public thesisRequired?: boolean

  @rprop({ type: () => XCreditsForCourseY })
  public xCreditsForCourseY!: XCreditsForCourseY[]

  @rprop({ type: () => XCreditsForCourseY })
  public maxCreditsInCombinationY!: XCreditsForCourseY[]

  @prop({ type: () => MaxCreditsForCourseY })
  public maxCreditsForCourseY?: MaxCreditsForCourseY

  @c({ type: () => [Course] })
  public coreCourses!: Course[]

  @prop({ type: () => minCourcesSubArea })
  public minOneCourseInEachSubArea?: minCourcesSubArea

  @prop({ type: () => minCourcesSubArea })
  public minTwoCourseInEachSubArea?: minCourcesSubArea

  @prop({ type: () => RegularLectureBasedCourses })
  public minRegularLectureCourses?: RegularLectureBasedCourses

  @prop({ type: () => RequiredCreditsOfCourseX })
  public requiredCreditsOfCourseX?: RequiredCreditsOfCourseX

  @rprop({ type: () => Elective })
  public elective!: Elective
}
