import defaultConfig from '../defaultConfig';
jest.mock('../../../version', () => '0.5.2');
const {
  formatCommitMessage,
  formatPullRequestTitle,
  formatPullRequestMessage,
  mergeStrategy: defaultMergeStrategy,
  shouldRelease,
} = defaultConfig;

describe('defaultConfig', () => {
  it('should export an object', () => {
    expect(defaultConfig).toMatchObject(expect.objectContaining({}));
  });

  it('formatCommitMessage', () => {
    const version = '0.1.2';
    expect(
      formatCommitMessage({
        version,
        mergeStrategy: { toSameBranch: ['master'] },
        baseBranch: 'master',
      })
    ).toBe(`chore: release v0.1.2`);

    expect(
      formatCommitMessage({
        version,
        mergeStrategy: {
          toReleaseBranch: { develop: 'master' },
          toSameBranch: [],
        },
        baseBranch: 'develop',
      })
    ).toBe(`chore: prepare v0.1.2`);
  });

  describe('formatPullRequestMessage', () => {
    const repoURL = 'https://github.com/algolia/shipjs';
    const baseBranch = 'master';
    const stagingBranch = 'releases/v0.1.1';
    const currentVersion = '0.1.0';
    const nextVersion = '0.1.1';

    it('gets message for same branch strategy', () => {
      const mergeStrategy = {
        toSameBranch: ['master'],
        toReleaseBranch: {},
      };
      const destinationBranch = 'master';
      const message = formatPullRequestMessage({
        formatPullRequestTitle,
        repoURL,
        baseBranch,
        stagingBranch,
        destinationBranch,
        mergeStrategy,
        currentVersion,
        nextVersion,
      });
      expect(message).toMatchInlineSnapshot(`
        "chore: release v0.1.1

        ## Release Summary
        - Version change: \`v0.1.0\` → \`v0.1.1\`
        - Merge: \`releases/v0.1.1\` → \`master\`
        - [Compare the changes between the versions](https://github.com/algolia/shipjs/compare/v0.1.0...releases/v0.1.1)
        > :warning: When merging this pull request, you need to **_\\"Squash and merge\\"_** and make sure the title starts with \`chore: release v0.1.1\`.
        > After that, a commit \`chore: release v0.1.1\` will be added and \`shipjs trigger\` will be able to trigger the release based on the commit.
        > Fore more information, please refer to the mergeStrategy section of the [guide](https://github.com/algolia/shipjs/blob/master/GUIDE.md#mergestrategy).
        > ![Squash and merge](https://raw.githubusercontent.com/algolia/shipjs/v0.5.2/assets/squash-and-merge.png)

        ---
        _This pull request is automatically generated by [Ship.js](https://github.com/algolia/shipjs)_"
      `);
      expect(message).toEqual(
        expect.stringContaining('Compare the changes between the versions')
      );
    });

    it('gets message for release branch strategy', () => {
      const mergeStrategy = {
        toSameBranch: [],
        toReleaseBranch: {
          master: 'release/stable',
        },
      };
      const destinationBranch = 'release/stable';
      const message = formatPullRequestMessage({
        formatPullRequestTitle,
        repoURL,
        baseBranch,
        stagingBranch,
        destinationBranch,
        mergeStrategy,
        currentVersion,
        nextVersion,
      });
      expect(message).toMatchInlineSnapshot(`
        "chore: release v0.1.1

        ## Release Summary
        - Version change: \`v0.1.0\` → \`v0.1.1\`
        - Merge: \`releases/v0.1.1\` → \`release/stable\`
        > :warning:️ When merging this pull request, you need to **_\\"Merge pull request(Create a merge commit)\\"_** and also, you must modify the title to start with \`chore: release v0.1.1\`.
        > After that, a commit \`chore: release v0.1.1\` will be added and \`shipjs trigger\` will be able to trigger the release based on the commit.
        > Fore more information, please refer to the mergeStrategy section of the [guide](https://github.com/algolia/shipjs/blob/master/GUIDE.md#mergestrategy).
        > ![Merge pull request](https://raw.githubusercontent.com/algolia/shipjs/v0.5.2/assets/merge-pull-request.png)

        ---
        _This pull request is automatically generated by [Ship.js](https://github.com/algolia/shipjs)_"
      `);
    });
  });

  it('gets default mergeStrategy', () => {
    expect(defaultMergeStrategy).toMatchInlineSnapshot(`
                  Object {
                    "toSameBranch": Array [
                      "master",
                    ],
                  }
            `);
  });

  describe('shouldRelease', () => {
    const currentVersion = '0.1.2';
    const commitMessage = 'chore: release v0.1.2';

    it('returns error with wrong commit message', () => {
      const mergeStrategy = {
        toSameBranch: ['master'],
        toReleaseBranch: {},
      };
      const currentBranch = 'master';
      const result = shouldRelease({
        commitMessage: '',
        currentVersion,
        currentBranch,
        mergeStrategy,
        formatPullRequestTitle,
      });
      expect(result).toMatchInlineSnapshot(`
        "The commit message should have started with the following:
        chore: release v0.1.2"
      `);
    });

    it('returns true with same branch strategy', () => {
      const mergeStrategy = {
        toSameBranch: ['master'],
        toReleaseBranch: {},
      };
      const currentBranch = 'master';
      const result = shouldRelease({
        commitMessage,
        currentVersion,
        currentBranch,
        mergeStrategy,
        formatPullRequestTitle,
      });
      expect(result).toBe(true);
    });

    it('returns true with release branch strategy', () => {
      const mergeStrategy = {
        toSameBranch: [],
        toReleaseBranch: {
          master: 'release/stable',
        },
      };
      const currentBranch = 'release/stable';
      const result = shouldRelease({
        commitMessage,
        currentVersion,
        currentBranch,
        mergeStrategy,
        formatPullRequestTitle,
      });
      expect(result).toBe(true);
    });

    it('returns error without matching any strategy', () => {
      const mergeStrategy = {
        toSameBranch: ['master'],
        toReleaseBranch: {
          dev: 'release/legacy',
        },
      };
      const currentBranch = 'develop';
      const result = shouldRelease({
        commitMessage,
        currentVersion,
        currentBranch,
        mergeStrategy,
        formatPullRequestTitle,
      });
      expect(result).toMatchInlineSnapshot(
        `"The current branch needs to be one of [master, release/legacy]"`
      );
    });
  });
});
