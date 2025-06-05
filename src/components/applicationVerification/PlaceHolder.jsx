import React, { useState } from 'react';
import { MdVerifiedUser } from 'react-icons/md';
import TextField from '../shared/small/TextField';
import Button from '../shared/small/Button';
import { MdOutlinePercent } from 'react-icons/md';

function PlaceHolder({ data, updateField, index }) {
  const [tab, setTab] = useState('Type Signature');
  return (
    <div className="mt-14 rounded-lg border p-6 shadow-md">
      <TextField label={'SSN'} />
      <TextField label={'Addblk'} />
      <TextField label={'Ownership %'} rightIcon={<MdOutlinePercent />} />
    </div>
  );
}

export default PlaceHolder;
