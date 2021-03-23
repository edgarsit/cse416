import { Ref } from '@typegoose/typegoose';

import { rprop } from './common';
import { Student } from './users';

export class DegreeRequirements {
    @rprop()
    public department!: string

    @rprop()
    public track!: string

    @rprop()
    public requirementVersion!: string

    @rprop()
    public creditsNeededToGraduate!: number

    @rprop({ type: () => [String] })
    public requirements!: [string]
}

export class CourePlanComment {
    @rprop({ ref: () => Student })
    public author!: Ref<Student>

    @rprop()
    public text!: string
}

export class CoursePlan {
    @rprop({ type: () => [[String]] })
    public comments!: [string][]

    @rprop({ type: () => [Course] })
    public courses!: Course[]
}

export class Course {
    @rprop()
    public department!: string

    @rprop()
    public courseNum!: string

    @rprop()
    public section!: string

    @rprop()
    public year!: Date

    @rprop()
    public timeslot!: String

    @rprop({ ref: () => Course })
    public prerequisites!: Ref<Course>[]
}
