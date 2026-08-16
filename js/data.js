export const GAMES = [
  {
    id: 'bitlife',
    name: 'BitLife',
    icon: './assets/bitlife-icon.svg',
    description: 'BitLife Android mod releases.',
    releases: [
      {
        id: 'bitlife-1-4',
        title: 'Fixes and Improvements',
        version: 'v1.4',
        platform: 'BitLife 3.24',
        date: '2026-08-16',
        isLatestUpdate: true,
        changelog: [
          { type: 'fix', text: 'Fixed Talent Modifier' },
          { type: 'fix', text: 'Fixed Cult' },
          { type: 'fix', text: 'Fixed Mafia Family' },
          { type: 'fix', text: 'Fixed Product Supplier' },
          { type: 'improve', text: 'Improved Military Rank Modifier' }
        ],
        requires: 'BitLife v3.24',
        downloadUrl: 'https://upfiles.com/pKts5',
        mirrorUrl: 'https://cuty.io/rEhhlJzjTLv'
      },
      {
        id: 'bitlife-1-3',
        title: 'Added Customizable Purchase',
        version: 'v1.3',
        platform: 'BitLife 3.24',
        date: '2026-08-05',
        isLatestUpdate: false,
        changelog: [
          { type: 'add', text: 'Added Purchase Menu' },
          { type: 'fix', text: 'Fixed Athlete Features Not Working' }
        ],
        requires: 'BitLife v3.24',
        downloadUrl: 'https://upfiles.com/MNcis',
        mirrorUrl: 'https://cuty.io/ayE1YYfSb'
      },
      {
        id: 'bitlife-1-2',
        title: 'Bug Fixes',
        version: 'v1.2',
        platform: 'BitLife 3.24',
        date: '2026-08-01',
        isLatestUpdate: false,
        changelog: [
          { type: 'add', text: 'Added Update Checks' },
          { type: 'fix', text: 'Fixed some features not working' }
        ],
        requires: 'BitLife v3.24',
        downloadUrl: 'https://upfiles.com/RdG2Q',
        mirrorUrl: 'https://cuty.io/7dx3'
      },
      {
        id: 'bitlife-1-0',
        title: 'New Royal Menu',
        version: 'v1.0',
        platform: 'BitLife 3.24',
        date: '2026-07-28',
        isLatestUpdate: false,
        changelog: [
          { type: 'add', text: 'Added New Royal Menu.' },
          { type: 'add', text: 'You can now become Royal anytime with the help of the mod!' }
        ],
        requires: 'BitLife v3.24',
        downloadUrl: 'https://upfiles.com/IOELuguw',
        mirrorUrl: 'https://cuty.io/lW9yR'
      }
    ]
  }
];
