# LinkedIn to JSON Resume importer

Inspired by the deprecated https://github.com/mblarsen/resume-linkedin. The deprecation was due to 
[these changes](https://developer.linkedin.com/blog/posts/2015/developer-program-changes) in the LinkedIn API.

I found that the developer console, supplied with the right API request, can produce the data necessary to produce a 
JSON resume.

The resulting `resume.json` is lightly opinionated but relatively straightforward ([see here for a basic mapping guide](#field-mapping)). 

There is one unique addition: The skills category mapping from [config.js](#config.js) maps a JSON resume skill 
definition more as a broad category. For instance, the `Web Development` category lists keywords refining that category, 
like `"HTML5", "Javascript", "CSS"`. The `Certifications` category is reserved for the certifications listed in LinkedIn 
and always the first listed to hopefully make it stand out.

## Instructions

1. Go to [https://developer.linkedin.com/rest-console](https://developer.linkedin.com/rest-console) in your browser 
(redirects to [https://apigee.com/console/linkedin](https://apigee.com/console/linkedin)) 
2. Under the `Authentication` section, select *OAuth2* from the dropdown. 
3. When the modal pops up, select `Sign in with LinkedIn`. 
4. You may be prompted to grant access to the developer console by using your credentials to login.
5. Under `Request URL` make sure a *GET* request is selected and paste the output from running `node fields.js`.
6. Under the `Response` pane, expand the `{}` if collapsed and copy the entire JSON object. This is part is annoying.
7. Open [data.js](#data.js) and set `module.exports = [JSON object copied from step 6]`
8. Run `node resume.js` and if all goes well, your output should be saved as `resume.json`

## Modules

### config.js

Configuration objects for the [fields.js](#fields.js) module, skills category mapping, and the [data.js](#data.js) module

#### Skills categories

An array of category objects defined by `category`, `level`, and array of `skills`.

*This is just a different representation of the existing schema for skills*

### data.js

LinkedIn API data exported from the console. This is currently not populated to encourage others to fill it in. I may 
look into other ways to populate this but I needed something quick for now.

### fields.js

Prints the LinkedIn API request to return a full profile with only the configured fields exposed. 
Utilizes the [config.js](#config.js) to build the full url as `config.api.url + parameters + "?format=" + config.api.format`.

This is gathered from [https://developer.linkedin.com/docs/signin-with-linkedin](https://developer.linkedin.com/docs/signin-with-linkedin) 
under the section marked **Requesting additional profile fields**.

### resume.js

Convert the LinkedIn API JSON data ([data.js](#data.js)) into the `resume.json` JSON resume output. 

## Field mapping

* name -> formattedName
* label -> headline?
* picture -> pictureUrl (save locally first?)
* email -> emailAddress
* phone -> phoneNumbers
* website [Not exposed via API]
* summary -> summary
* location -> mainAddress
* profiles
    * linkedin -> publicProfileUrl
    * twitter -> primaryTwitterAccount
    * github [manual entry]
* work -> positions
* volunteer -> volunteer, projects
* education -> educations
* awards -> honorsAwards
* publications -> publications
* skills
    * certifications -> by keyword
    * skills -> categories by keyword
* languages -> languages
* interests -> interests
* references -> recommendationsReceived
