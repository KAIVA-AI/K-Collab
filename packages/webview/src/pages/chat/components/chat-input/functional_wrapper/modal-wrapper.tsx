import React, {
  forwardRef,
  useState,
  useImperativeHandle,
  useEffect,
} from 'react';
import Modal, { ModalProps, ModalRef } from '../custom-modal'; // Import your Modal component

export interface ModalWrapperProps
  extends Omit<ModalProps, 'isOpen' | 'onClose'> {}

const ModalWrapper = forwardRef<ModalRef, ModalWrapperProps>(
  ({ tabs }, ref) => {
    const [isOpen, setIsOpen] = useState(false);

    useImperativeHandle(ref, () => ({
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
    }));

    // Track changes to props (e.g., `tabs`)
    useEffect(() => {
      console.log('ModalWrapper props changed:', { tabs });
    }, [tabs]);

    const handleClose = () => setIsOpen(false);

    return (
      <Modal ref={ref} isOpen={isOpen} onClose={handleClose} tabs={tabs} />
    );
  },
);

export default ModalWrapper;
