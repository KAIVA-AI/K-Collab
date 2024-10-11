import { ChannelMessages, CurrentUser, Message, Providers, UserPresence, Users } from "../types"

export const mockUser0 = {
    id: 'user0',
    name: 'John',
    fullName: 'John Doe',
    imageUrl: 'https://images.unsplash.com/photo-1606045555551-423ba7ede64f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cHJvZmVzb3J8ZW58MHx8MHx8fDA%3D',
    smallImageUrl: 'https://images.unsplash.com/photo-1606045555551-423ba7ede64f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cHJvZmVzb3J8ZW58MHx8MHx8fDA%3D',
    presence: UserPresence.idle,
}

export const mockUser1 = {
    id: 'user1',
    name: 'Jessica Tess',
    fullName: 'Jessica Tess',
    imageUrl: 'https://thumbs.dreamstime.com/z/young-brunette-female-boxer-16459709.jpg',
    smallImageUrl: 'https://thumbs.dreamstime.com/z/young-brunette-female-boxer-16459709.jpg',
    presence: UserPresence.idle,
}

export const mockUser2 = {
    id: 'user2',
    name: 'John Mike',
    fullName: 'John Mike',
    imageUrl: 'https://thumbs.dreamstime.com/z/casual-portrait-mature-happy-man-taken-outside-33228755.jpg',
    smallImageUrl: 'https://thumbs.dreamstime.com/z/casual-portrait-mature-happy-man-taken-outside-33228755.jpg',
    presence: UserPresence.doNotDisturb,
}

export const mockUser3 = {
    id: 'user3',
    name: 'Emily',
    fullName: 'Emily Jin',
    imageUrl: 'https://plus.unsplash.com/premium_photo-1687832254772-5714db9a35c6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fHRlZW58ZW58MHx8MHx8fDA%3D',
    smallImageUrl: 'https://plus.unsplash.com/premium_photo-1687832254772-5714db9a35c6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fHRlZW58ZW58MHx8MHx8fDA%3D',
    presence: UserPresence.available,
}

export const mockBot = {
    id: 'bo1',
    name: 'Welcome Bot',
    fullName: 'Welcome Bot',
    imageUrl: 'https://thumbs.dreamstime.com/z/chat-bot-concept-d-rendering-humanoid-robot-headset-144813648.jpg',
    smallImageUrl: 'https://thumbs.dreamstime.com/z/chat-bot-concept-d-rendering-humanoid-robot-headset-144813648.jpg',
    presence: UserPresence.available,
}

export const mockUsers: Users = {
    'user0': mockUser0,
    'user1': mockUser1,
    'user2': mockUser2,
    'user3': mockUser3,
    'bot1': mockBot,

};

export const mockCurrentUser: CurrentUser = {
    id: 'user0',
    name: 'John Doe',
    teams: [
        {
            id: 'team1',
            name: 'Team 1'
        },
        {
            id: 'team2',
            name: 'Team 2'
        }
    ],
    currentTeamId: 'team1',
    provider: Providers.zulip
};

// export const mockChanel: Channel = {
//     id: 'group1',
//     name: 'Inbox',
//     type: ChannelType.group,
//     readTimestamp: '2020-01-01T12:00:00Z',
//     unreadCount: 2
// };

// export const mockChannels: Channel[] = [
//     {
//         id: 'group1',
//         name: 'Inbox',
//         type: ChannelType.group,
//         readTimestamp: '2020-01-01T12:00:00Z',
//         unreadCount: 2,
//         notableMark: NotableMark.inbox
//     },
//     {
//         id: 'group2',
//         name: 'Recent conversations',
//         type: ChannelType.group,
//         readTimestamp: undefined,
//         unreadCount: 1,
//         notableMark: NotableMark.recent
//     },
//     {
//         id: 'group3',
//         name: 'All messages',
//         type: ChannelType.group,
//         readTimestamp: '2020-01-02T14:00:00Z',
//         unreadCount: 5,
//         contactMetadata: {
//             id: 'user123',
//             email: 'avb@gmail.com',
//         },
//         notableMark: NotableMark.allMessage
//     },
//     {
//         id: 'group4',
//         name: 'Mentions',
//         type: ChannelType.group,
//         readTimestamp: undefined,
//         unreadCount: 0,
//         contactMetadata: {
//             id: 'user456',
//             email: 'avb@gmail.com',
//         },
//         notableMark: NotableMark.mentions
//     },
//     {
//         id: 'group5',
//         name: 'Starred messages',
//         type: ChannelType.group,
//         readTimestamp: undefined,
//         unreadCount: 0,
//         notableMark: NotableMark.starred
//     },
//     {
//         id: 'group6',
//         name: 'Drafts',
//         type: ChannelType.group,
//         readTimestamp: undefined,
//         unreadCount: 0,
//         notableMark: NotableMark.drafts
//     },
// ];

export const mockMessage: Message = {
    timestamp: '1702456227',
    userId: 'user1',
    text: 'Hi John Doe, I\'m Jessica Tess. Nice to meet you!',
    reactions: [],
    topic: 'general',
    replies: {
        '1702456227': {
            userId: 'user0',
            timestamp: '1702456227',
            text: 'Hey Jessica Tess, pleasure to meet you too. What brings you here?',
        },
        '1702456327': {
            userId: 'user1',
            timestamp: '1702456327',
            text: 'Just exploring and meeting new people. How about you?',
        },
        '1702456427': {
            userId: 'user0',
            timestamp: '1702456427',
            text: 'Same here! I love discovering new places and making new connections. What do you enjoy doing in your free time?',
        },
        '1702456527': {
            userId: 'user1',
            timestamp: '1702456527',
            text: 'I\'m into photography and hiking. Capturing moments in nature is my thing. How about you?',
        },
        '1702456627': {
            userId: 'user0',
            timestamp: '1702456627',
            text: 'Oh, that\'s cool! I enjoy painting and reading. Hiking sounds like a great way to unwind. Where\'s your favorite place to hike?',
        },
    },
    content: {
        author: 'Jessica Tess',
        pretext: '',
        title: '',
        titleLink: '',
        text: '',
        footer: ''
    }
};

export const mockMessage2: Message = {
    timestamp: '1702456727',
    userId: 'user2',
    text: 'Hi there, I\'m Michael Johnson. Nice to meet you!',
    reactions: [],
    topic: 'general',
    replies: {
        '1702456827': {
            userId: 'user0',
            timestamp: '1702456827',
            text: 'Hey Michael Johnson, pleasure to meet you too. What department are you working in?',
        },
        '1702456927': {
            userId: 'user1',
            timestamp: '1702456927',
            text: 'I just joined the marketing team. How about you?',
        },
        '1702457027': {
            userId: 'user0',
            timestamp: '1702457027',
            text: 'Nice! I\'m in the finance department. What made you choose marketing?',
        },
        '1702457127': {
            userId: 'user1',
            timestamp: '1702457127',
            text: 'I\'ve always been fascinated by consumer behavior and creative strategies. It seemed like a perfect fit. What do you enjoy about finance?',
        },
        '1702457227': {
            userId: 'user0',
            timestamp: '1702457227',
            text: 'I like the analytical side of things and helping the company make informed financial decisions. Do you have any specific projects you\'re excited about in marketing?',
        }
    },
    content: undefined
};

export const mockMessage3: Message = {
    timestamp: '1702458727',
    userId: 'user3',
    text: 'Hi there, I\'m Emily. Nice to meet you!',
    reactions: [],
    topic: 'general',
    replies: {
        '1702458727': {
            userId: 'user1',
            timestamp: '1702458727',
            text: 'Hey Emily, pleasure to meet you too. What do you do for fun?',
        },
        '1702458827': {
            userId: 'user3',
            timestamp: '1702458827',
            text: 'I love hiking and reading. How about you?',
        },
        '1702455927': {
            userId: 'user2',
            timestamp: '1702455927',
            text: 'Nice! I enjoy painting and playing the guitar. Do you have a favorite book or hiking spot?',
        }
    },
    content: undefined
};

export const mockMessage4: Message = {
    timestamp: '17024584707',
    userId: 'user0',
    text: 'I watched "Inception" again. Love the mind-bending concept. How about you?',
    reactions: [],
    topic: 'general',
    replies: {},
    content: undefined
};

export const mockMessage5: Message = {
    timestamp: '1702458707',
    userId: 'user2',
    text: 'Hey, I\'m Ryan. Love exploring new places!',
    reactions: [],
    topic: 'general',
    replies: {
        '1702458707': {
            userId: 'user0',
            timestamp: '1702458707',
            text: 'Hi Ryan! Me too. Any favorite travel destination?',
        },
        '1702457027': {
            userId: 'user2',
            timestamp: '1702457027',
            text: 'Definitely Japan. The culture and food are amazing. How about you?',
        },
        '1702457127': {
            userId: 'user0',
            timestamp: '1702457127',
            text: 'Nice choice! I love Italy for the history and cuisine. Any upcoming travel plans?',
        }
    },
    content: undefined
};



export const mockedChannelMessages: ChannelMessages = {
    '1702456227': mockMessage,
    '1702456727': mockMessage2,
    '1702458727': mockMessage3,
    '17024584707': mockMessage4,
    '1702458707': mockMessage5,
};