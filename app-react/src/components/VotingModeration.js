import { useContractWrite, usePrepareContractWrite } from "wagmi";
import { Form, Input, Button, Collapse, notification } from "antd";
import votingABI from "../abi/votingABI";
import { useState, useEffect } from "react";
import { FormOutlined } from "@ant-design/icons";

const { Panel } = Collapse;

const VotingModeration = ({ votingAddress }) => {
  const [title, setTitle] = useState("");

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

  const { config: titleConfig } = usePrepareContractWrite({
    address: votingAddress,
    abi: votingABI,
    functionName: "changeTitle",
    args: [title],
  });

  const {
    isLoading,
    isSuccess,
    write: changeTitle,
  } = useContractWrite(titleConfig);

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
  return (
    <>
      <Collapse accordion style={{ marginBottom: "20px" }}>
        <Panel header="Voting moderation" key="1">
          <Form>
            <Form.Item
              required={false}
              label="Title"
              name="title"
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: "Please input title",
                },
              ]}
            >
              <Input
                prefix={<FormOutlined style={{ color: "grey" }} />}
                allowClear
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Form.Item>
            <Form.Item
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
              }}
            >
              <Button danger htmlType="submit" onClick={() => changeTitle?.()}>
                Change Title
              </Button>
            </Form.Item>
          </Form>
        </Panel>
      </Collapse>
    </>
  );
};

export default VotingModeration;
