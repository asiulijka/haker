const Photo = require('../models/photo.model');
const Voter = require('../models/Voter.model');

/****** SUBMIT PHOTO ********/

exports.add = async (req, res) => {

  try {
    const { title, author, email } = req.fields;
    const file = req.files.file;

    if(title && author && email && file) { // if fields are not empty...

      // Photo validation
      const fileName = file.path.split('/').slice(-1)[0]; // cut only filename from full path, e.g. C:/test/abc.jpg -> abc.jpg
      const acceptableImgExtensions = ['jpg', 'jpeg', 'gif', 'png'];
      const imgExtension = fileName.split('.')[1];
      if (acceptableImgExtensions.indexOf(imgExtension) == -1){
        throw new Error('Not an image!');
      }

      // Title validation
      const pattern = new RegExp(/(<\s*(strong|em)*>(([A-z]|\s)*)<\s*\/\s*(strong|em)>)|(([A-z]|\s|\.)*)/, 'g');
      const titleMatched = title.match(pattern).join('');
      if(titleMatched.length < title.length) throw new Error('Invalid characters in title...');
      if(title.length > 25) throw new Error('Author too long!');

      // Author validation
      const authorMatched = author.match(pattern).join('');
      if(authorMatched.length < author.length) throw new Error('Invalid characters in author...');
      if(author.length > 50) throw new Error('Author too long!');

      // Email validation
      const eMailPattern = new RegExp(/^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/, 'g');
      const emailMatched = email.match(eMailPattern).join('');
      if(emailMatched.length < email.length) throw new Error('Invalid characters in email...');

      const newPhoto = new Photo({ title, author, email, src: fileName, votes: 0 });
      await newPhoto.save(); // ...save new photo in DB
      res.json(newPhoto);

    } else {
      throw new Error('Wrong input!');
    }

  } catch(err) {
    res.status(500).json(err);
  }

};

/****** LOAD ALL PHOTOS ********/

exports.loadAll = async (req, res) => {

  try {
    res.json(await Photo.find());
  } catch(err) {
    res.status(500).json(err);
  }

};

/****** VOTE FOR PHOTO ********/

exports.vote = async (req, res) => {

  try {
    const photoToUpdate = await Photo.findOne({ _id: req.params.id });
    if(!photoToUpdate) res.status(404).json({ message: 'Not found' });
    else {

      const voter = await Voter.findOne({ user: req.ip });
      
      if (!voter){
        // console.log('Nie ma i nie glosowal');
        const newVoter = new Voter({ user: req.ip, votes: [req.params.id]});
        await newVoter.save();

        photoToUpdate.votes++;
        photoToUpdate.save();
        res.send({ message: 'OK' });
      } 
      else {
        // console.log('Jest');
        // console.log(req.params.id);
        // console.log(voter.votes);
        // console.log(voter.votes.indexOf(req.params.id));

        if(voter.votes.indexOf(req.params.id) == -1){
          // console.log('Nie glosowal - dodajemy');
          voter.votes.push(req.params.id);
          await voter.save();

          photoToUpdate.votes++;
          photoToUpdate.save();
          res.send({ message: 'OK' });
        } else {
          // console.log('Glosowal - nie dodajemy!');
        }
      };
      // console.log(await Voter.findOne({ user: req.ip }));
    }
  } catch(err) {
    res.status(500).json(err);
  }
};
