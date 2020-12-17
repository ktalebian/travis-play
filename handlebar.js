// matches a v1.2.3..v2.3.4 format
const rangeRegex = /^v\d+\.\d+\.\d+(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+)?..v\d+\.\d+\.\d+(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+)?$/;
const releaseRegex = /Release \d+\.\d+\.\d+(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+)?/;

module.exports = function (Handlebars) {
    const compact = (data, children) => {
        const release = data.root.releases.find((release) => rangeRegex.test(release.diff))   // filter out diffs from header;
        release.commits = release.commits.filter((commit) => !releaseRegex.test(commit.subject));

        const messages = [];
        // Merges messages
        if (release.merges.length) {
            messages.push('## Merges');
        }
        release.merges.forEach(({ message, href, id}) => {
            const link = href ? ` [${id}](${href})` : '';

            messages.push(`- ${message}${link}`);
        });
        if (release.merges.length) {
            messages.push('');
        }

        // Fixes
        if (release.fixes.length) {
            messages.push('## Fixes');
        }
        release.fixes.forEach(({ commit, fixes}) => {
            const fix = fixes.map(({href, id}) => href ? ` [${id}](${href})` : '');

            messages.push(`- ${commit.subject}${fix}`);
        });
        if (release.fixes.length) {
            messages.push('');
        }

        // Commits
        if (release.commits.length) {
            messages.push('## Commits');
        }
        release.commits.forEach(({ breaking, subject, href, shorthash}) => {
            const breakingChanges = breaking ? '**Breaking change:** ' : '';
            const link = href ? ` [${shorthash}](${href})` : '';

            messages.push(`- ${breakingChanges}${subject}${link}`);
        });

    //    release.merges.forEach(({}) => {
    //        messages.push(`- {{${message}}}{{#if href}} [`#{{id}}`]({{href}}){{/if}}`)
    //    })
       
        return messages.join('\n')
    };

    Handlebars.registerHelper('generate', function (format, { data, fn }) {
        format = format || 'compact';
        
        return compact(data, fn(this));
    });
}

// {{#each merges}}
//       - {{{message}}}{{#if href}} [`#{{id}}`]({{href}}){{/if}}
//     {{/each}}
//     {{#each fixes}}
//       - {{{commit.subject}}}{{#each fixes}}{{#if href}} [`#{{id}}`]({{href}}){{/if}}{{/each}}
//     {{/each}}
//     {{#each commits}}
//       - {{#if breaking}}**Breaking change:** {{/if}}{{{subject}}}{{#if href}} [`{{shorthash}}`]({{href}}){{/if}}
//     {{/each}}