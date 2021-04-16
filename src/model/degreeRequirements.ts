import { Course } from './course';
import { rprop } from './util';

export class XCreditsForCourseY {
    @rprop()
    public credits!: number

    @rprop()
    public course!: string
}

export class MaxCreditsForCourseY {
    @rprop()
    public credits!: number

    @rprop({ type: () => [Course] })
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

    @rprop({ type: () => [Course] })
    public notCountedCourses!: Course[]

    @rprop({ type: () => [Course] })
    public courawaOnlyOnce!: Course[]
}

export class RequiredCreditsOfCourseX {
    @rprop()
    public minCredits!: number

    @rprop()
    public maxCredits!: number

    @rprop({ type: () => [Course] })
    public substitutionsWithApproval!: Course[]
}

export class SubArea {
    @rprop()
    public name!: string

    @rprop({ type: () => [Course] })
    public courses!: Course[]
}

export class DegreeRequirements {
    @rprop()
    public degreeName!: string

    @rprop()
    public requirementVersion!: string

    @rprop()
    public track!: string

    @rprop()
    public minimumCumulativeGPA!: string

    @rprop()
    public timelimit!: string

    @rprop({ map: ['Required', 'Not-Required'] })
    public finalRecomendation!: boolean

    @rprop()
    public creditsNeededToGraduate!: number

    @rprop({ ref: () => XCreditsGradeY })
    public prerequisites!: XCreditsGradeY

    @rprop({ type: () => [Course] })
    public coreCourses!: Course[]

    @rprop({ type: () => [Tracks] })
    public tracks!: Tracks[]
}

export class Elective {
    @rprop()
    public numCourses!: number

    @rprop()
    public totalCredits!: number

    @rprop()
    public range!: string

    @rprop({ type: () => [[String]] })
    public substitutions!: [string][]
}

export class Tracks {
    @rprop()
    public name!: string

    @rprop()
    public totalCredits!: number

    @rprop({ map: ['False', 'True'] })
    public thesisRequired!: boolean

    @rprop({ type: () => XCreditsForCourseY })
    public xCreditsForCourseY!: XCreditsForCourseY[]

    @rprop({ type: () => XCreditsForCourseY })
    public maxCreditsInCombinationY!: XCreditsForCourseY[]

    @rprop({ type: () => MaxCreditsForCourseY })
    public maxCreditsForCourseY!: MaxCreditsForCourseY

    @rprop({ type: () => [Course] })
    public coreCourses!: Course[]

    @rprop({ type: () => minCourcesSubArea })
    public minOneCourseInEachSubArea!: minCourcesSubArea

    @rprop({ type: () => minCourcesSubArea })
    public minTwoCourseInEachSubArea!: minCourcesSubArea

    @rprop({ type: () => RegularLectureBasedCourses })
    public minRegularLectureCourses!: RegularLectureBasedCourses

    @rprop({ type: () => RequiredCreditsOfCourseX })
    public requiredCreditsOfCourseX!: RequiredCreditsOfCourseX

    @rprop({ type: () => Elective })
    public electives!: Elective
}
