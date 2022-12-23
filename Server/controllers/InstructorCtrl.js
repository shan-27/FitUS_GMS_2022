const Instructors = require("../models/InstructorModel");
const MealPlans = require("../models/MealModel");
const Members = require("../models/MemberModel");
const Exercies = require("../models/ExerciesModel");

const Message = require("../models/MessagesModel");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendMail = require("./sendMail");
const { ACTIVATION_TOKEN_SECRET, CLIENT_URL } = require("../config/key");

const instructorCtrl = {
  // Instructor Registration (S)
  register: async (req, res) => {
    try {
      const {
        name,
        lastname,
        email,
        phone,
        emgNo,
        nic,
        password,
        address,
        dob,
        gender,
      } = req.body;

      if (
        !name ||
        !lastname ||
        !email ||
        !phone ||
        !password ||
        !emgNo ||
        !nic ||
        !address ||
        !dob ||
        !gender
      )
        return res.status(400).json({ msg: "Please fill in all fields." });

      if (!validateEmail(email))
        return res.status(400).json({ msg: "Invalid email." });

      const instructor = await Instructors.findOne({ email });
      if (instructor)
        return res.status(400).json({ msg: "This email already exists" });

      if (password.length < 8)
        return res
          .status(400)
          .json({ msg: "Password must be at least 8 characters" });

      const passwordHash = await bcrypt.hash(password, 12);

      const newInstructor = {
        name,
        lastname,
        email,
        phone,
        emgNo,
        nic,
        password: passwordHash,
        address,
        dob,
        gender,
      };

      const activation_token = createActivationToken(newInstructor);

      const url = `${CLIENT_URL}/instructor/activation/${activation_token}`;
      sendMail(email, url, "Verify your email");
      console.log({ activation_token });

      console.log({ activation_token });
      res.json({ msg: "Registration Success! Please activate your account." });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  //Instructor Activation (S)
  activateEmail: async (req, res) => {
    try {
      const activation_token = req.params.token;

      const instructor = jwt.verify(activation_token, ACTIVATION_TOKEN_SECRET);

      console.log(instructor);

      const {
        name,
        lastname,
        email,
        phone,
        emgNo,
        nic,
        password,
        address,
        dob,
        gender,
      } = instructor;

      const check = await Instructors.findOne({ email });
      if (check)
        return res.status(400).json({ msg: "This email is already exists" });

      const newInstructor = new Instructors({
        name: name,
        lastname: lastname,
        email: email,
        phone: phone,
        password: password,
        address: address,
        dob: dob,
        nic: nic,
        emgNo: emgNo,
        gender: gender,
      });

      await newInstructor.save();
      console.log(newInstructor);
      res.json({ msg: "Account has been activated" });
    } catch (err) {
      console.log(err);
      if (
        err.message ==
        "E11000 duplicate key error collection: test.members index: Email_1 dup key: { Email: null }"
      ) {
        return res.json({ msg: "Account has been activated" });
      }
      return res.status(500).json({ msg: err.message });
    }
  },

  //Instructor Login (H)
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const instructor = await Instructors.findOne({ email });
      if (!instructor)
        return res.status(400).json({ msg: "This E-mail does not exist." });

      const isMatch = await bcrypt.compare(password, instructor.password);
      if (!isMatch)
        return res.status(400).json({ msg: "Password is incorrect." });

      const refresh_token = createRefreshToken({
        id: instructor._id,
        role: "instructor",
      });
      res.json({ msg: "Login success!", token: refresh_token });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ msg: err.message });
    }
  },

  getAccessToken: (req, res) => {
    try {
      const rf_token = req.cookies.refreshtoken;
      console.log(rf_token);
      if (!rf_token) return res.status(400).json({ msg: "Please login now!" });

      jwt.verify(
        rf_token,
        "#^j?4RyY!U3cMPU=x~^GGVQuf#J&p1xKcJmRz*sU8J!C#ENtJq",
        (err, instructor) => {
          if (err) return res.status(400).json({ msg: "Please login now!" });

          const access_token = createAccessToken({ id: instructor.id });
          console.log({ access_token });
          res.json({ access_token });
        }
      );
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  //Instructor forgot password (S)
  forgotPW: async (req, res) => {
    try {
      const { Email } = req.body;
      const instructor = await Instructors.findOne({ Email });
      if (!instructor)
        return res.status(400).json({ msg: "This email does not exist." });

      const access_token = createAccessToken({ id: instructor._id });
      console.log({ access_token });
      const url = `${CLIENT_URL}/instructor/reset/${access_token}`;

      sendMail(Email, url, "Reset your Instructor account password");
      res.json({ msg: "Please check your email to reset your password" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  //Instructor Reset password (H)
  resetPW: async (req, res) => {
    try {
      const { Password } = req.body;
      console.log(Password);
      const passwordHash = await bcrypt.hash(Password, 12);

      console.log(req.instructor);
      await Instructors.findOneAndUpdate(
        { _id: req.instructor.id },
        {
          Password: passwordHash,
        }
      );

      res.json({ msg: "Password successfully changed!" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  //Get instructor info (S)
  getInstructorInfo: async (req, res) => {
    try {
      const instructor = await Instructors.findById(req.instructor.id).select(
        "-Password"
      );

      res.json(instructor);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  //Instructor Logout (S)
  logout: async (req, res) => {
    try {
      res.clearCookie("refreshtoken", { path: "/instructor/refresh_token" });
      return res.json({ msg: "You have successfully logged out." });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  //Update instructor info (H)
  updateInstructor: async (req, res) => {
    try {
      const {
        FirstName,
        LastName,
        PhNo,
        EmgNo,
        NIC,
        Address,
        DoB,
        Gender,
        avatar,
      } = req.body;
      await Instructors.findOneAndUpdate(
        { _id: req.instructor.id },
        {
          FirstName,
          LastName,
          PhNo,
          EmgNo,
          NIC,
          Address,
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

  //Upload avatar (S)

  //Admin
  //get all instructor info as Admin (S)
  getAllinstructors: async (req, res) => {
    try {
      //console.log(req.instructor)
      const instructors = await Instructors.find().select("-Password");
      res.json(instructors);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  //get all member info as Admin (S)
  getAllmembers: async (req, res) => {
    try {
      //console.log(req.member)
      const members = await Members.find().select("-Password");
      res.json(members);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  //Update instructor role (S)
  updateRole: async (req, res) => {
    try {
      const { id, index } = req.body;
      console.log(req.body);
      const instructor = await Instructors.findById(id);

      if (instructor) {
        const verify = await instructor.updateOne({ role: index });
        if (verify.modifiedCount === 1) {
          return res.json({ msg: "Successfully updated as a Admin!" });
        } else {
          throw new Error({ msg: "update Failed Instructor" });
        }
      } else {
        throw new Error({ msg: "Invalid Instructor" });
      }
    } catch (err) {
      console.log(err);
      return res.status(500).json({ msg: err.message });
    }
  },

  //Delete instructor (H)
  deleteInstructor: async (req, res) => {
    try {
      await Instructors.findByIdAndDelete(req.params.id);

      res.json({ msg: "Deleted success!" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  //Delete member (H)
  deleteMember: async (req, res) => {
    try {
      await Members.findByIdAndDelete(req.params.id);

      res.json({ msg: "Deleted success!" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  createMealPlan: async (req, res) => {
    try {
      const {
        id,
        mealName,
        monday,
        group,
        tuesday,
        wednesday,
        thursday,
        friday,
        saturday,
        sunday,
      } = req.body;

      console.log(req.body);

      const meal = MealPlans({
        instructorId: id,
        group: group,
        mealName: mealName,
        mondayPlan: monday,
        tuesdayPlan: tuesday,
        wednesdayPlan: wednesday,
        thursdayPlan: thursday,
        fridayPlan: friday,
        saturdayPlan: saturday,
        sundayPlan: sunday,
      });
      await meal.save();
      res.json({ msg: "meal Created" });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ msg: err.message });
    }
  },

  createExercies: async (req, res) => {
    try {
      const { equipment, gifUrl, name, target, bodyPart, group } = req.body;

      console.log(req.body);
      const meal = new Exercies({
        bodyPart: bodyPart,
        group: group,
        equipment: equipment,
        gifUrl: gifUrl,
        name: name,
        target: target,
      });
      await meal.save();
      res.json({ msg: "Exercies Created" });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ msg: err.message });
    }
  },
  getExercies: async (req, res) => {
    try {
      const exersices = await Exercies.find();

      res.json(exersices);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  getMeals: async (req, res) => {
    try {
      const meals = await MealPlans.find();
      res.json(meals);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  //Add members to a group
  addMembersToGroup: async (req, res) => {
    try {
      const { group, email } = req.body;
      console.log(req.body);
      const member = await Members.findOne({ email: email });
      if (!member) {
        throw new Error("Invalid User Email");
      }
      const verify = await member.updateOne({ group: group });
      if (verify.modifiedCount === 1) {
        res.json({ msg: "Update Success!" });
      } else {
        throw new Error("Update Failed");
      }
    } catch (err) {
      console.log(err);
      return res.status(500).json(err.message);
    }
  },

  //Get Messages
  getAllmessages: async (req, res) => {
    try {
      const messages = await Message.find();
      if (messages == {}) {
        return res.status(500).json({ msg: "No Messsages" });
      }
      res.json(messages);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
    //Add message
    addMessage: async (req, res) => {
      try {
        const { sender, msgBody } = req.body;

        let today = new Date();

        let year = today.getFullYear();
        let month = today.getMonth() + 1;
        let datetoday = today.getDate();

        let date = `${datetoday}/${month}/${year}`;

        let hours = today.getHours();
        let minutes = today.getMinutes();

        let time = `${hours}.${minutes}`;

        if (!msgBody || !date || !time)
          return res.status(400).json({ msg: "Please fill in all fields." });

        const newMessage = new Message({
          sender,
          msgBody,
          time,
          date,
        });
        await newMessage.save();
        res.json({ msg: "New message has been added" });
      } catch (err) {
        console.log(err)
        return res.status(500).json({ msg: err.message });
      }
  }
};

const validateEmail = (email) => {
  return email.match(
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );
};

const createActivationToken = (payload) => {
  return jwt.sign(payload, process.env.ACTIVATION_TOKEN_SECRET, {
    expiresIn: "5m",
  });
};

const createAccessToken = (payload) => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
};

const createRefreshToken = (payload) => {
  return jwt.sign(
    payload,
    "#^j?4RyY!U3cMPU=x~^GGVQuf#J&p1xKcJmRz*sU8J!C#ENtJq",
    { expiresIn: "7d" }
  );
};

module.exports = instructorCtrl;
