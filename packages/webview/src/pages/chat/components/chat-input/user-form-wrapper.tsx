// Wrapper functional component for UserUploadForm
import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { UserUploadForm } from './user-upload-form';

const UserUploadFormWrapper = React.forwardRef((props, ref) => {
  const methods = useForm();

  return (
    <FormProvider {...methods}>
      <UserUploadForm ref={ref} {...props} />
    </FormProvider>
  );
});

export default UserUploadFormWrapper;
