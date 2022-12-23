const Members = require("../models/MemberModel");
const MealModel = require('../models/MealModel');
const Exercies = require('../models/ExerciesModel');
const Instructors = require('../models/InstructorModel');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendMail = require("./sendMail");
const { UserRefreshClient } = require("google-auth-library");
const e = require("express");
// const sendEmail = require("./sendMail");

const {CLIENT_URL, REFRESH_TOKEN_SECRET, ACCESS_TOKEN_SECRET, ACTIVATION_TOKEN_SECRET} = require('../config/key')

const memberCtrl = {
  // Member Registration (S)
  register: async (req, res) => {
    try {
      const {
        name,
        lastname,
        email,
        phone,
        password,
        height,
        weight,
        address,
        occupation,
        dob,
        gender,
      } = req.body;

      if (
        !name ||
        !lastname ||
        !email ||
        !phone ||
        !password ||
        !height ||
        !weight ||
        !address ||
        !occupation ||
        !dob ||
        !gender
      )
        return res.status(400).json({ msg: "Please fill in all fields." });

      if (!validateEmail(email))
        return res.status(400).json({ msg: "Invalid email." });

      const member = await Members.findOne({ email });
      if (member)
        return res.status(400).json({ msg: "This email already exists" });

      if (password.length < 8)
        return res
          .status(400)
          .json({ msg: "Password must be at least 8 characters" });

      const passwordHash = await bcrypt.hash(password, 12);

      const newMember = {
        name,
        lastname,
        email,
        phone,
        password,
        height,
        weight,
        address,
        occupation,
        dob,
        gender,
      };

      const activation_token = createActivationToken(newMember);

      const url = `${CLIENT_URL}/member/activation/${activation_token}`;
      sendMail(email, url, "Verfy your email");
      console.log({ activation_token });

      res.json({ msg: "Registration Success! Please activate your account." });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ msg: err.message });
    }
  },



  

  //Member Activation (S)
  activateEmail: async (req, res) => {
    try {
      const activation_token = req.params.token;
      const member = jwt.verify(
        activation_token,
        ACTIVATION_TOKEN_SECRET
      );
      const {
        name,
        lastname,
        email,
        phone,
        password,
        height,
        weight,
        address,
        occupation,
        dob,
        gender,
      } = member;

      const check = await Members.findOne({ email });
      if (check)
        return res.status(400).json({ msg: "This email is already exists" });
      const newMember = new Members({
        name: name,
        lastname:lastname,
        email:email,
        phone:phone,
        password:password,
        height:height,
        weight: weight,
        address: address,
        occupation: occupation,
        dob: dob,
        gender:gender,
      }
        
      );

      await newMember.save();
    
      res.json({ msg: "Account has been activated" });
    } catch (err) {
      console.log(err)
      if (
        err.message ==
        "E11000 duplicate key error collection: test.members index: Email_1 dup key: { Email: null }"
      ) {
        return res.json({ msg: "Account has been activated" });
      }
      return res.status(500).json({ msg: err.message });
    }
  },

  //Member Login (H)
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const member = await Members.findOne({ email });

      if (!member)
        return res.status(400).json({ msg: "This E-mail does not exist." });

      if (member.password !== password) {
        return res.status(400).json({ msg: "Password is incorrect." });
      }

      console.log(member);
      const refresh_token = createRefreshToken({ id: member._id, role :"member" });
      //   res.cookie("refreshtoken", refresh_token, {
      //     httpOnly: true,
      //     path: "/member/refresh_token",
      //     maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      //   });
      res.json({ msg: "Login success!", token: refresh_token });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  // (H)
  getAccessToken: (req, res) => {
    try {
      const rf_token = req.cookies.refreshtoken;
      if (!rf_token) return res.status(400).json({ msg: "Please login now!" });

      jwt.verify(
        rf_token,
        REFRESH_TOKEN_SECRET,
        (err, member) => {
          if (err) return res.status(400).json({ msg: "Please login now!" });

          const access_token = createAccessToken({ id: member.id });
          console.log({ access_token });
          res.json({ access_token });
        }
      );
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  //Member Forgot password (S)
  forgotPW: async (req, res) => {
    try {
      const { Email } = req.body;
      const member = await Members.findOne({ Email });
      if (!member)
        return res.status(400).json({ msg: "This email does not exist." });

      const access_token = createAccessToken({ id: member._id });
      console.log({ access_token });
      const url = `${CLIENT_URL}/member/reset/${access_token}`;

      sendMail(Email, url, "Reset your password");
      res.json({ msg: "Please check your email to reset your password" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  //Member Reset password (H)
  resetPW: async (req, res) => {
    try {
      const { Password } = req.body;
      console.log(Password);
      const passwordHash = await bcrypt.hash(Password, 12);

      console.log(req.member);
      await Members.findOneAndUpdate(
        { _id: req.member.id },
        {
          Password: passwordHash,
        }
      );

      res.json({ msg: "Password successfully changed!" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  //Get member info (S)
  getMemberInfo: async (req, res) => {
    try {
      if(req.member) {
        const member = await Members.findById(req.member.id).select("-Password")
      return  res.json(member);
      } else {
        const instructor = await Instructors.findById(req.instructor.id).select(
          "-Password"
        );
  
      return  res.json(instructor);

      }
      ;
      
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  getAllMembers: async (req, res) => {
    try {
      //console.log(req.instructor)
      const members = await Members.find().select("-Password");
      res.json(members);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },





  //Member Logout (S)
  logout: async (req, res) => {
    try {
      res.clearCookie("refreshtoken", { path: "/member/refresh_token" });
      return res.json({ msg: "You have successfully logged out." });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  //Update Member info (H)
  updateMember: async (req, res) => {
    try {
      const {
        FirstName,
        LastName,
        PhNo,
        Height,
        Weight,
        Address,
        Occupation,
        DoB,
        Gender,
        avatar,
      } = req.body;
      await Members.findOneAndUpdate(
        { _id: req.member.id },
        {
          FirstName,
          LastName,
          PhNo,
          Height,
          Weight,
          Address,
          Occupation,
          DoB,
          Gender,
          avatar,
        }
      );

      res.json({ msg: "Update Success!" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  //Get Meal Plans
  getAllmealplans: async (req, res) => {
    try {
      const token = req.header("Authorization");

      if (!token) return res.status(400).json({ msg: "Invalid Authentication." });
  
      const { id } = jwt.verify(
        token,
        REFRESH_TOKEN_SECRET)
        const member = await Members.findById(id)
        const mealplans = await MealModel.find({group:member.group})
        if(mealplans == {}){
            return res.status(500).json({msg: "No Meal Plans"})
        }
        res.json(mealplans)
    } catch (err) {
      console.log(err)
        return res.status(500).json({msg: err.message})
    }
},

//Get Workouts
getAllworkouts: async (req, res) => {
  try {
    const token = req.header("Authorization");

    if (!token) return res.status(400).json({ msg: "Invalid Authentication." });

    const { id } = jwt.verify(
      token,
      REFRESH_TOKEN_SECRET)
      const member = await Members.findById(id)
      //console.log(member.groupno)
      //const group = member.groupno

      const workouts = await Exercies.find({group:member.group})
      if(workouts == {}){
          return res.status(500).json({msg: "No Meal Plans"})
      }
      res.json(workouts)


  } catch (err) {
      return res.status(500).json({msg: err.message})
  }
},








  //Upload avatar
};

const validateEmail = (email) => {
  return email.match(
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );
};

//password check
//number check

const createActivationToken = (payload) => {
  return jwt.sign(payload, ACTIVATION_TOKEN_SECRET, {
    expiresIn: "5m",
  });
};

const createAccessToken = (payload) => {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
};

const createRefreshToken = (payload) => {
  return jwt.sign(
    payload,
    REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
};

module.exports = memberCtrl;
