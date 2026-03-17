import React, { useState, useRef } from "react";
import axios from "axios";
import "./ProfileEditor.css";

const ProfileEditor = ({ user, onClose, onUpdate }) => {
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [avatar, setAvatar] = useState(user?.avatar || null);
  const [avatarColor, setAvatarColor] = useState(
    user?.avatarColor || "#4ECDC4",
  );
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const predefinedColors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#FFA07A",
    "#98D8C8",
    "#F7DC6F",
    "#BB8FCE",
    "#85C1E2",
    "#F06292",
    "#64B5F6",
    "#81C784",
    "#FFD54F",
  ];

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatar(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data } = await axios.put("/api/auth/profile", {
        displayName: displayName.trim(),
        bio: bio.trim(),
        avatar,
        avatarColor,
      });

      if (data.success) {
        const updatedUser = data.data;

        // ✅ Update parent component (AuthContext)
        onUpdate(updatedUser);

        // ✅ Close modal
        onClose();

        console.log("✅ Profile updated successfully!");
      } else {
        alert(data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Update error:", error);
      alert(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = () => {
    const name = displayName || user?.username || "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="profile-editor-overlay" onClick={onClose}>
      <div
        className="profile-editor-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="profile-editor-header">
          <h2>Edit Profile</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="profile-editor-form">
          {/* Avatar Section */}
          <div className="avatar-section">
            <div className="avatar-preview">
              {avatar ? (
                <img src={avatar} alt="Avatar" className="avatar-image" />
              ) : (
                <div
                  className="avatar-placeholder"
                  style={{ backgroundColor: avatarColor }}
                >
                  {getInitials()}
                </div>
              )}
            </div>

            <div className="avatar-controls">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => fileInputRef.current?.click()}
              >
                Upload Photo
              </button>
              {avatar && (
                <button
                  type="button"
                  className="btn-danger"
                  onClick={handleRemoveAvatar}
                >
                  Remove
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: "none" }}
              />
            </div>

            {/* Color Picker */}
            {!avatar && (
              <div className="color-picker">
                <label>Avatar Color:</label>
                <div className="color-options">
                  {predefinedColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`color-option ${avatarColor === color ? "active" : ""}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setAvatarColor(color)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Display Name */}
          <div className="form-group">
            <label htmlFor="displayName">Display Name</label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              maxLength={50}
            />
          </div>

          {/* Bio */}
          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              maxLength={150}
              rows={3}
            />
            <span className="char-count">{bio.length}/150</span>
          </div>

          {/* Action Buttons */}
          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button type="submit" className="btn-save" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEditor;
