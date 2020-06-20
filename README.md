A web app for exploring fatal police shootings in USA 2019. See [police-shooting-data](https://github.com/oreganolisk/police-shooting-data) for more information about the data.

To run the app locally:
1) Clone this repo
2) `npm install`
3) `npm start`

To update the database, set the commit hash in the `package.json` reference to `police-shooting-data`, then run `npm install`.

To deploy this as a heroku app, use the `mars/create-react-app` buildpack, which you can set as follows in heroku CLI:

`heroku buildpacks:set mars/create-react-app`

This work is in the [public domain](https://creativecommons.org/publicdomain/zero/1.0/). You can use it as you see fit with no attribution.
