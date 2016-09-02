var fs = require("fs"),
  resumeSchema = require("resume-schema"),
  log = require("debug")("resume");

function pad(n) {
  return n < 10 ? "0" + n.toString(10) : n.toString(10);
}

function timestamp() {
  var date = new Date();
  return [date.getUTCFullYear(), pad(date.getUTCMonth()), pad(date.getUTCDay())].join("-");
}

function createDate(date, isCurrent) {
  if (isCurrent !== undefined && isCurrent.valueOf() === true) {
    return timestamp();
  }
  if (date.day) {
    return [date.year, pad(date.month), pad(date.day)].join("-");
  }
  if (date.month) {
    return [date.year, pad(date.month), "01"].join("-");
  }
  return String(date.year + "-01-01");
}

function createCertifications(certifications) {
  return {
    name: "Certifications",
    keywords: certifications.values.map(function (object) {
      return object.name;
    })
  };
}

function createSkills(skills, categories) {
  // TODO: Correlate LinkedIn skills object with categories array
  return categories.map(function (object) {
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

function getLinkedInUserName(publicProfileUrl) {
  return publicProfileUrl.replace(/https:\/\/www\.linkedin\.com\/in\//, "");
}

function mapObject(linkedIn, template, categories) {
  log("creating resume");
  var output = template;

  // Name
  output.basics.name = linkedIn.formattedName;
  // Label
  if (linkedIn.headline) {
    output.basics.label = linkedIn.headline;
  }
  // Picture
  output.basics.picture = linkedIn.pictureUrl;
  // Email
  if (output.basics.email)
    output.basics.email = linkedIn.emailAddress;
  // Phone number(s)
  if (linkedIn.phoneNumbers) {
    var collection = linkedIn.phoneNumbers.values;
    if (collection) {
      for (i = 0, max = collection.length; i < max; i += 1) {
        log("adding phone " + collection[i].phoneType + " " + collection[i].phoneNumber);
        output.basics["phone"][collection[i].phoneType] = collection[i].phoneNumber;
      }
    }
  }
  // Summary
  if (linkedIn.summary) {
    output.basics.summary = linkedIn.summary;
  }
  // Location
  if (output.basics.location)
    if (linkedIn.mainAddress) {

    }
  // Profiles
  // LinkedIn
  if (linkedIn.publicProfileUrl) {
    output.basics.profiles.push({
      "network": "LinkedIn",
      "username": getLinkedInUserName(linkedIn.publicProfileUrl),
      "url": linkedIn.publicProfileUrl
    });
  }
  // Twitter
  if (linkedIn.primaryTwitterAccount) {
    output.basics.profiles.push({
      "network": "Twitter",
      "username": linkedIn.primaryTwitterAccount.providerAccountName,
      // TODO: Create this url better
      "url": "http://twitter.com/" + linkedIn.primaryTwitterAccount.providerAccountName
    });
  }
  // Work
  if (linkedIn.positions) {
    output["work"] = linkedIn.positions.values.map(function (object) {
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
  if (linkedIn.educations) {
    output["education"] = linkedIn.educations.values.map(function (object) {
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
  if (linkedIn.honorsAwards) {
    output["awards"] = linkedIn.honorsAwards.values.map(function (object) {
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
  if (linkedIn.publications) {
    output["publications"] = linkedIn.publications.values.map(function (object) {
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
  if (linkedIn.certifications) {
    var certifications = createCertifications(linkedIn.certifications);
    log("adding certifications as a skill entry");
    //console.log(certifications);
    output["skills"].push(certifications);
  }
  if (linkedIn.skills) {
    var skills = createSkills(linkedIn.skills, categories);
    //console.log(skills);
    output["skills"] = output["skills"].concat(skills);
  }
  // Languages
  if (linkedIn.languages) {
    output["languages"] = linkedIn.languages.values.map(function (object) {
      log("adding language" + object.language.name);
      return {
        name: object.language.name,
        // TODO: Create enumerated list
        fluency: "Native speaker"
      };
    });
  }
  // Interests
  if (linkedIn.interests) {
    output["interests"] = linkedIn.interests.split("\n").map(function (object) {
      var name = object.replace(/,\s*$/, "");
      log("adding interest" + name);
      return {
        name: name
      };
    });
  }
  // References
  if (linkedIn.recommendationsReceived) {
    output["references"] = linkedIn.recommendationsReceived.values.map(function (object) {
      log("adding reference from " + object.recommender.firstName + " " + object.recommender.lastName);
      return {
        name: object.recommender.firstName + " " + object.recommender.lastName,
        reference: object.recommendationText
      };
    });
  }

  return output;
}

function convert(data, template, categories, outputFile) {
  console.error(JSON.stringify(data));

  var output = mapObject(data, template, categories);
  // console.error(output);

  // var resumeString = JSON.stringify(output, undefined, 2);
  // console.error(resumeString);

  resumeSchema.validate(output, function (result, error) {
    var exitCode = 0;
    if (error || result.valid !== true) {
      console.error(error);
      console.error(result);
      exitCode = 1;
    } else {
      var resumeString = JSON.stringify(output, undefined, 2);
      console.log("Saving resume.json: " + resumeString.length);
      fs.writeFileSync(outputFile, resumeString);
      console.log("Done!");
    }
    process.exit(exitCode);
  });
}

module.exports = {
  convert: convert
};
