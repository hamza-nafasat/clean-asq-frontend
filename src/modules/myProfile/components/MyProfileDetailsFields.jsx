import TextField from "@/components/shared/TextField";

const MyProfileDetailsFields = ({ profile = {}, isEditing = false, onChange }) => (
  <>
    <section>
      <h3 className="text-textPrimary mb-4 text-lg font-semibold">Personal Information</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <TextField
          borderAndBgChangeIfEmpty={false}
          name="firstName"
          label="First Name"
          placeholder="Enter first name"
          required
          disabled={!isEditing}
          value={profile.firstName}
          onChange={onChange}
        />
        <TextField
          borderAndBgChangeIfEmpty={false}
          name="middleName"
          label="Middle Name"
          placeholder="Enter middle name"
          disabled={!isEditing}
          value={profile.middleName}
          onChange={onChange}
        />
        <TextField
          borderAndBgChangeIfEmpty={false}
          name="lastName"
          label="Last Name"
          placeholder="Enter last name"
          disabled={!isEditing}
          value={profile.lastName}
          onChange={onChange}
        />
        <TextField
          borderAndBgChangeIfEmpty={false}
          type="email"
          name="email"
          label="Email"
          placeholder="Email address"
          disabled
          value={profile.email}
          onChange={onChange}
        />
        <TextField
          borderAndBgChangeIfEmpty={false}
          name="role"
          label="Role"
          placeholder="Role"
          disabled
          value={profile.role}
          onChange={onChange}
        />
        <TextField
          borderAndBgChangeIfEmpty={false}
          name="contact"
          label="Contact"
          placeholder="Enter contact number"
          type="tel"
          disabled={!isEditing}
          value={profile.contact}
          onChange={onChange}
        />
      </div>
    </section>

    <section>
      <h3 className="text-textPrimary mb-4 text-lg font-semibold">Address Details</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <TextField
            borderAndBgChangeIfEmpty={false}
            name="address"
            label="Address"
            placeholder="Enter address"
            disabled={!isEditing}
            value={profile.address}
            onChange={onChange}
          />
        </div>
        <TextField
          borderAndBgChangeIfEmpty={false}
          name="state"
          label="State"
          placeholder="Enter state"
          disabled={!isEditing}
          value={profile.state}
          onChange={onChange}
        />
        <TextField
          borderAndBgChangeIfEmpty={false}
          name="country"
          label="Country"
          placeholder="Enter country"
          disabled={!isEditing}
          value={profile.country}
          onChange={onChange}
        />
      </div>
    </section>
  </>
);

export default MyProfileDetailsFields;
