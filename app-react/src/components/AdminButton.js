import React, { useEffect, useState } from "react";
import {
  useContractRead,
  useAccount,
  useContractWrite,
  usePrepareContractWrite,
} from "wagmi";
import { Address, ABI } from "../contracts/sbtContract";
import useGetIsModerator from "../utils/isModerator";
import useGetIsAdmin from "../utils/isAdmin";
import { Card, Typography, Modal, Form, Input, Button } from "antd";

const { Title, Text } = Typography;

const AdminModeratorButtons = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  //Contract part
  const { address } = useAccount();

  //Modal part
  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };
  //

  //Admin and Moderator part
  const isAdmin = useGetIsAdmin();
  //
  return (
    <Card title="">
      <Modal
        title="Admin options"
        open={isModalOpen}
        onOk={handleOk}
        onShow={showModal}
        onCancel={handleCancel}
      >
        <Form>
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: "Please input your username!" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
      <Button type="primary" onClick={showModal}>
        Admin options
      </Button>
    </Card>
  );
};

export default AdminModeratorButtons;
