const mongoose = require("mongoose");

const ProfileSchema = mongoose.Schema(
  {
    storeName: { 
      type: String, 
      required: true 
    },
    address: { 
      type: String, 
      required: true 
    },
    state: { 
      type: String, 
      required: true 
    },
    city: { 
      type: String, 
      required: true 
    },
    village: { 
      type: String, 
      required: true 
    },
    pincode: { 
      type: String, 
      required: true 
    },
    pancard: { 
      type: String, 
      required: true,
      unique: true,
    },
    gstno: { 
      type: String, 
      required: true,
      unique: true,
    },
    createdBy: { 
       type: mongoose.Schema.Types.ObjectId,
       ref: "admin", 
       required: true,
        }, 
    images: [
          {
            public_id: String,
            url: String,
          },
        ],
  },

  {
    timestamps: true,
  }
);

const Profile = mongoose.model("profile", ProfileSchema);

module.exports = Profile;