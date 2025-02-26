type Modify<T, R> = Omit<T, keyof R> & R;

export type Media =
    | {
          kind: 'text';
          message: string;
          tag?: string;
      }
    | {
          kind: 'image';
          url: string;
          alt?: string;
          tag?: string;
      }
    | {
          kind: 'video';
          url: string;
          tag?: string;
          captions?: {
              url: string;
              srclang?: string;
              label?: string;
          }[];
      };

export type AccountId = string;
export type CommunityId = string;
export type ContentId = string;
export type PlatformId = string;
export type ModeratorId = string;
export type RuleId = string;
export type OrganizationId = string;
export type RelevantId = ContentId | AccountId | CommunityId;

export type PossibleAction = {
    id: string;
    display?: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link';
};

export type Account = {
    created?: Date;
    name?: string;
    recentContentIds?: ContentId[];
    possibleActions: PossibleAction[];
};

export type Community = {
    created?: Date;
    name?: string;
    recentContentIds?: ContentId[];
    adminstratorsIds?: AccountId[];
    possibleActions: PossibleAction[];
};

export type Content = {
    created?: Date;
    medias: Media[];
    author?: AccountId;
    community?: CommunityId;
    context?: ContentId[];
    possibleActions: PossibleAction[];
};

export type CustomAction = {
    kind: 'custom';
    id: string;
    display: string;
};

export type DiscussionAction = {
    kind: 'comment';
    text: string;
};

export type PlatformAction =
    // | {
    // 		kind: 'report';
    // 		category?: string;
    // 		additionalInfo?: string;
    //   }
    // | {
    // 		kind: 'appeal';
    // 		reasoning: Media[];
    //   }
    {
        kind: 'requestPublication';
    };

export type ActionDB = {
    platformId: PlatformId;
    relevantId: RelevantId;
    kind: 'content' | 'user' | 'community';
    name?: string;
    createdAt: string;
    actionInfo: string;
};

export type Action = {
    platformId: PlatformId;
    relevantId: RelevantId;
    kindId: 'content' | 'user' | 'community';
    name?: string;
    createdAt: Date;
} & (CustomAction | DiscussionAction | PlatformAction);

export type Platform = {
    id: PlatformId;
    organizationId: OrganizationId;
    name: string;
    callbackUrl: string;
    secret: string;
};

export type OrganizationDB = {
    id: OrganizationId;
    name: string;
    createdAt: string;
    updatedAt: string;
};

export type Organization = Modify<OrganizationDB, { createdAt: Date; updatedAt: Date }>;

export type RuleDB = {
    ruleId: RuleId;
    platformId: PlatformId;
    readableName: string;
    information: string;
    active: number;
    createdAt: string;
    updatedAt: string;
};

export type RuleInformation = {
    title: string;
    description: string;
};

export type Rule = Modify<
    RuleDB,
    {
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        information: RuleInformation;
    }
>;

export type CaseDB = {
    platformId: PlatformId;
    relevantId: RelevantId;
    kind: 'content' | 'user' | 'community';
    status: 'unresolved' | 'resolved';
    createdAt: string;
    updatedAt: string;
};

export type Case = Modify<
    CaseDB,
    {
        createdAt: Date;
        updatedAt: Date;
    }
>;

export type Result<T, E> = { valid: true; data: T } | { valid: false; error: E };

export function success<T>(data: T): Result<T, never> {
    return { valid: true, data };
}

export function failure<E>(error: E): Result<never, E> {
    return { valid: false, error };
}

export function getError(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    } else if (typeof error === 'string') {
        return error;
    } else {
        return 'Unknown error';
    }
}

// Type helper to extract tuple type from array types
type ArrayElements<T> = T extends Array<infer U> ? U : never;

// Type helper for the resulting tuple type
type ZippedTuple<T extends Array<unknown>[]> = {
    [K in keyof T]: ArrayElements<T[K]>;
};

export function zip<T extends Array<unknown>[]>(...arrays: [...T]): Array<ZippedTuple<T>> {
    if (arrays.length === 0) return [];

    // Find the length of the shortest array
    const minLength = Math.min(...arrays.map((arr) => arr.length));

    // Create the zipped array
    const result = Array(minLength);

    for (let i = 0; i < minLength; i++) {
        result[i] = arrays.map((arr) => arr[i]) as ZippedTuple<T>;
    }

    return result;
}

export type PlatformNotificationEvent = {
    platformId: string;
    case: {
        id: string;
        kind: string;
    };
    action: string;
};
