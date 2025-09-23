import { Exercise, ExerciseCategory } from './types';

export const EXERCISES: Exercise[] = [
    {
        id: '1',
        name: 'Jab-Cross',
        description: 'Basic 1-2 punch combination.',
        category: ExerciseCategory.BOXING,
        duration: 180,
    },
    {
        id: '2',
        name: 'Hook-Uppercut',
        description: 'Left hook followed by a right uppercut.',
        category: ExerciseCategory.BOXING,
        duration: 180,
    },
    {
        id: '3',
        name: 'Roundhouse Kick',
        description: 'A powerful kick using the shin.',
        category: ExerciseCategory.KICKBOXING,
        duration: 180,
    },
    {
        id: '4',
        name: 'Takedown defense',
        description: 'Sprawl to defend against a takedown.',
        category: ExerciseCategory.MMA,
        duration: 180,
    },
];