export interface Workshop {
    id?: string;
    name: string;
    imageURL?: string;
    presenter1: string;
    presenter2?: string;
    description: string;
    room: string;
    session1?: {
        available?: boolean;
        totalSeats?: number;
        // availableSeats?: number;
        registered?: any[];
    };
    session2?: {
        available?: boolean;
        totalSeats?: number;
        // availableSeats?: number;
        registered?: any[];
    };
    session3?: {
        available?: boolean;
        totalSeats?: number;
        // availableSeats?: number;
        registered?: any[];
    };
}
