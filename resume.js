var config = require('./config'),
  fs = require('fs'),
  resumeSchema = require('resume-schema'),
  log = require('debug')('resume');

var data = {
  "basics": {
    "name": "",
    "label": "",
    "picture": "",
    "email": "",
    "phone": "",
    "website": "",
    "summary": "",
    "location": {
      "address": "",
      "postalCode": "",
      "city": "",
      "countryCode": "",
      "region": ""
    },
    "profiles": []
  },
  "work": [],
  "volunteer": [],
  "education": [],
  "awards": [],
  "publications": [],
  "skills": [],
  "languages": [],
  "interests": [],
  "references": []
};

function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}

function timestamp() {
  var d = new Date();
  return [d.getUTCFullYear(), pad(d.getUTCMonth()), pad(d.getUTCDay())].join('-');
}

function createDate(dateObject, isCurrent) {
  if (isCurrent !== undefined && isCurrent.valueOf() === true) {
    return timestamp();
  }
  if (dateObject.day) {
    return [dateObject.year, pad(dateObject.month), pad(dateObject.day)].join('-');
  }
  if (dateObject.month) {
    return [dateObject.year, pad(dateObject.month), "01"].join('-');
  }
  return String(dateObject.year + "-01-01");
}

function createCertifications($certifications) {
  return {
    name: "Certifications",
    keywords: $certifications.values.map(function (object) {
      return object.name;
    })
  };
}

function createSkills($skills, $categories) {
  // TODO: Correlate LinkedIn $skills object with $categories array
  return $categories.map(function (object) {
    log("adding category " + object.category);
    if (object.level) {
      return {
        name: object.category,
        level: object.level,
        keywords: object.skills
      };
    } else {
      return {
        name: object.category,
        keywords: object.skills
      };
    }
  });
}

function getLinkedInUserName($publicProfileUrl) {
  return $publicProfileUrl.replace(/https:\/\/www\.linkedin\.com\/in\//, "");
}

function createObject($in) {
  log("creating resume");
  // Name
  data.basics.name = $in.formattedName;
  // Label
  if ($in.headline) {
    data.basics.label = $in.headline;
  }
  // Picture
  data.basics.picture = $in.pictureUrl;
  // Email
  data.basics.email = $in.emailAddress;
  // Phone number(s)
  if ($in.phoneNumbers) {
    var collection = $in.phoneNumbers.values;
    if (collection) {
      for (i = 0, max = collection.length; i < max; i += 1) {
        log('adding phone ' + collection[i].phoneType + ' ' + collection[i].phoneNumber);
        data.basics['phone'][collection[i].phoneType] = collection[i].phoneNumber;
      }
    }
  }
  // Summary
  if ($in.summary) {
    data.basics.summary = $in.summary;
  }
  // Location
  if ($in.mainAddress) {

  }
  // Profiles
  // LinkedIn
  if ($in.publicProfileUrl) {
    data.basics.profiles.push({
      "network": "LinkedIn",
      "username": getLinkedInUserName($in.publicProfileUrl),
      "url": $in.publicProfileUrl
    });
  }
  // Twitter
  if ($in.primaryTwitterAccount) {
    data.basics.profiles.push({
      "network": "Twitter",
      "username": $in.primaryTwitterAccount.providerAccountName,
      // TODO: Create this url better
      "url": "http://twitter.com/" + $in.primaryTwitterAccount.providerAccountName
    });
  }
  // Work
  if ($in.positions) {
    data["work"] = $in.positions.values.map(function (object) {
      log("adding work " + object.company.name);
      var highlights = [];
      if (object.summary) {
        highlights = object.summary.split("\n").map(function (object) {
          var name = object.replace(/[^0-9a-zA-Z]+/, "");
          return name;
        });
      }
      if (Boolean(object.isCurrent)) {
        return {
          company: object.company.name,
          position: object.title,
          website: "",
          startDate: createDate(object.startDate),
          highlights: highlights // object.summary mapping
        }
      } else {
        return {
          company: object.company.name,
          position: object.title,
          website: "",
          startDate: createDate(object.startDate),
          endDate: createDate(object.endDate, Boolean(object.isCurrent)),
          highlights: highlights // object.summary mapping
        }
      }
    });
  }
  // Volunteer
  // Education
  if ($in.educations) {
    data["education"] = $in.educations.values.map(function (object) {
      log("adding education " + object.schoolName);
      return {
        institution: object.schoolName,
        startDate: createDate(object.startDate),
        endDate: createDate(object.endDate, object.isCurrent),
        area: object.fieldOfStudy,
        summary: object.notes,
        studyType: object.degree,
        courses: []
      };
    });
  }
  // Awards
  if ($in.honorsAwards) {
    data["awards"] = $in.honorsAwards.values.map(function (object) {
      log("adding award " + object.name);
      return {
        title: object.name,
        //date: "",
        awarder: "",
        summary: ""
      };
    });
  }
  // Publications
  if ($in.publications) {
    data["publications"] = $in.publications.values.map(function (object) {
      log("adding publication " + object.title);
      return {
        name: object.title,
        releaseDate: createDate(object.date),
        publisher: "",
        website: ""
      };
    });
  }
  // Skills
  if ($in.certifications) {
    var certifications = createCertifications($in.certifications);
    log("adding certifications as a skill entry");
    //console.log(certifications);
    data["skills"].push(certifications);
  }
  if ($in.skills) {
    var skills = createSkills($in.skills, config.skill_categories);
    //console.log(skills);
    data["skills"] = data["skills"].concat(skills);
  }
  // Languages
  if ($in.languages) {
    data["languages"] = $in.languages.values.map(function (object) {
      log("adding language" + object.language.name);
      return {
        name: object.language.name,
        // TODO: Create enumerated list
        fluency: "Native speaker"
      };
    });
  }
  // Interests
  if ($in.interests) {
    data["interests"] = $in.interests.split("\n").map(function (object) {
      var name = object.replace(/,\s*$/, "");
      log("adding interest" + name);
      return {
        name: name
      };
    });
  }
  // References
  if ($in.recommendationsReceived) {
    data["references"] = $in.recommendationsReceived.values.map(function (object) {
      log("adding reference from " + object.recommender.firstName + " " + object.recommender.lastName);
      return {
        name: object.recommender.firstName + " " + object.recommender.lastName,
        reference: object.recommendationText
      };
    });
  }

  return data;
}

$in = config.data;
//req.session.$in = $in;
//console.error(JSON.stringify($in));
data = createObject($in);
//console.error(data);

//var resumeString = JSON.stringify(data, undefined, 2);
//console.error(resumeString);

resumeSchema.validate(data, function (result, validationErr) {
  var exitCode = 0;
  if (validationErr || result.valid !== true) {
    console.error(validationErr);
    console.error(result);
    exitCode = 1;
  } else {
    var resumeString = JSON.stringify(data, undefined, 2);
    console.log('Saving file resume.json:' + resumeString.length);
    fs.writeFileSync(__dirname + '/resume.json', resumeString);
    console.log('Done!');
  }
  process.exit(exitCode);
});
