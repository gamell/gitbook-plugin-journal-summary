# gitbook-plugin-journal-summary
[![Build Status](https://travis-ci.org/gamell/gitbook-plugin-journal-summary.svg?branch=master)](https://travis-ci.org/gamell/gitbook-plugin-journal-summary) [![Dependencies Status](https://david-dm.org/gamell/gitbook-plugin-journal-summary.svg)](https://david-dm.org/gamell/gitbook-plugin-journal-summary) [![npm version](https://badge.fury.io/js/gitbook-plugin-journal-summary.svg)](https://badge.fury.io/js/gitbook-plugin-journal-summary)

This is a [Gitbook](https://github.com/GitbookIO/gitbook) plugin automatically generates your summary file(s) for your journal entries, effectively allowing you to use `gitbook` to compile your journal. It will automatically generate the `SUMMARY.md` and, optionally, intermediate summary files.

## Warning

**This plugin will overwrite your SUMMARY.md file, if any.** This plugin is meant to be used solely as a journaling helper so it's not a good idea to use it in a project where you want to be able to edit the `SUMMARY.md` file manually.

## Setup

Add this to your `bookj.json`:

```json

{
  "plugins": ["gitbook-plugin-journal-summary"]
}

```

Then run `gitbook build`

**If you run `gitbook serve` directly it might not correctly pickup the newly generated summary files, so I recommend running `gitbook build` first**

## Usage

This plugin expects your Markdown Journal Entries to be named in this pattern: `YYYY-MM-DD.md` (e.g. `2017-12-29`). It does not matter what folders or how many level deep you put your Markdown files. The plugin will find all the Markdown files that match the date format, build a tree with levels for Year, Month, and the individual entries as leafs. It will then output that in the correct format to the `SUMMARY.md` file.

For example, even with this messy (or "wrong") folder structure:

```
|
|- 2017-09-10.md
|
 \- 2017
|    \- 10
|        |- 2017-10-01.md
|  
 \- 2016
     |- 2016-02-28.md
     |- 2017-10-02.md
     \- 09
        |- 2016-09-01.md

```

The plugin will parse only the filenames, regardless of what folder the file is in, generating the correct working tree:

```
(root)
  |
   \_ 2016
  |    \_ February
  |   |      \_ 28th
  |    \_ September   
  |          \_ 1st  
   \_ 2017  
       \_ September   
      |     \_ 10th
       \_ October
            \_ 1st
           |
            \_ 2nd


```

Which will generate the following `SUMMARY.md` file (assuming `generateAll = true`):

```markdown
  # Book Title

  - [2016](summaries/2016.md)
    - [February](summaries/2016-February.md)
      - [28th](/2016/2016-02-28)
    - [September](summaries/2016-September.md)
      - [1st](/2016/09/2016-09-01.md)
  - [2017](summaries/2017.md)
    - [September](summaries/2017-September.md)
      - [10th](2017-09-10.md)
    - [October](/summaries/2017-October)
      - [1st](/2017/10/2017-10-01.md)
      - [2nd](/2016/2017-10-02.md)
```


## Configuration

Optionally, you can set the `generateAll` option to `true` if you want the plugin to also generate *intermediate* summary files for Year and Month levels, i.e. if you want the Year and Month levels to be `clickable` and to contain a summary of their contents. That option is to `false` by default. To set that option to true, add the following in your `book.json` file:

```json
  "pluginsConfig": {
    "journal": {
      "generateAll": true
    }
  }
```

An example of a complete `book.json` file could look like this:

```json
{
    "title": "Test Book",
    "plugins": ["journal-summary"],
    "pluginsConfig": {
      "journal": {
        "generateAll": true
      }
    }
}
```




## Credit

Initially based on [julianxhokaxhiu's gitbook plugin](https://github.com/julianxhokaxhiu/gitbook-plugin-summary).
