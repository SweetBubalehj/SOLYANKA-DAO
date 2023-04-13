import { useContractWrite, usePrepareContractWrite } from "wagmi";
import { Form, Input, Button, InputNumber, notification } from "antd";
import { Address, ABI } from "../contracts/sbtContract";
import { useState, useEffect } from "react";
import useCheckIdentity from "../utils/isIdentified";
import { MailOutlined, UserOutlined } from "@ant-design/icons";

function CreateIdentityForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState(13);

  const isVerified = useCheckIdentity();

  const { config } = usePrepareContractWrite({
    address: Address,
    abi: ABI,
    functionName: "createSoul",
    args: [name, email, age],
  });

  const { isLoading, isSuccess, write } = useContractWrite(config);

  const transactionIsSuccess = () => {
    notification.success({
      message: "Transaction successful",
      placement: "bottomRight",
    });
  };

  const transactionIsLoading = () => {
    notification.warning({
      message: "Check your wallet",
      placement: "bottomRight",
    });
  };

  useEffect(() => {
    if (isLoading) {
      transactionIsLoading();
    }
  }, [isLoading]);

  useEffect(() => {
    if (isSuccess) {
      transactionIsSuccess();
    }
  }, [isSuccess]);

  if (isVerified === undefined) {
    return;
  }

  if (isVerified) {
    return;
  }

  return (
    <Form>
      <Form.Item label="Name">
        <Input
          prefix={<UserOutlined style={{ color: "grey" }} />}
          allowClear
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </Form.Item>
      <Form.Item label="Email">
        <Input
          prefix={<MailOutlined style={{ color: "grey" }} />}
          allowClear
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Form.Item>
      <Form.Item
        label="Age Years"
        tooltip="Your age connected to address (PG-13)"
      >
        <InputNumber min={13} max={200} value={age} onChange={setAge} />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" onClick={() => write?.()}>
          Create Identity
        </Button>
      </Form.Item>
    </Form>
  );
}

export default CreateIdentityForm;
