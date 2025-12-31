const makeCompleteName = (firstName, middleName, lastName, fullName, name) => {
  if (firstName && middleName && lastName) {
    return firstName + ' ' + middleName + ' ' + lastName;
  } else if (firstName && lastName) {
    return firstName + ' ' + lastName;
  } else if (fullName) {
    return fullName;
  } else if (name) {
    return name;
  } else {
    return '';
  }
};

export default makeCompleteName;
