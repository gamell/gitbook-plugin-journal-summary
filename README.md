# gitbook-plugin-journal-summary

This plugin automatically generates your summary file(s) for your journal entries, effectively allowing you to use `gitbook` to compile your journal. It will automatically generate the `SUMMARY.md` and, optionally, intermediate summary files.

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

For example, the following book structure:

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

Will generate the following tree:

```
(root)
  |
   \_ 2016
  |    \_ February
  |   |       \_ 28th
  |    \_ September   
  |   |       \_ 

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
