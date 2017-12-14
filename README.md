# gitbook-plugin-journal-summary

This plugin is oriented to those who want to use `gitbook` as a journal. It will automatically generate the `SUMMARY.md` file for a

## Setup

Add this to your `bookj.js`:

```json

{
  "plugins": ["gitbook-plugin-journal-summary"]
}

```

Then run `gitbook serve` or `gitbook run`

## Usage

The plugin expects your Markdown files to be named in a correct date format, namely `YYYY-MM-DD.md`. It does not matter what folders or how many level deep you put your Markdown files. The plugin will find all the Markdown files that have a valid date format, build a tree where there are levels for Year, Month, and the leafs are the individual entries, and output that in the correct format to the `SUMMARY.md` file.

For example, the following book structure:

```
|
|- 2017
|   |
|   |- 10
|       |
|       |- 2017-10-01.md
|  
|- 2016
     |
     |- 2016-02-28.md
     |- 2017-10-02.md
     |- 09
        |
        |- 2016-09-01.md

```

Will generate the following tree:

```

|
|- 2016
|   |- 02
|   |    \_ 2016-02-28.md
|   |- 09   
|   |   |

```

You can define a title

## Config

_Soon_

##

## Credit

Based on [julianxhokaxhiu's gitbook plugin](https://github.com/julianxhokaxhiu/gitbook-plugin-summary).
