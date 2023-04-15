import React, { useState, useEffect } from "react";
import { useContractWrite, usePrepareContractWrite } from "wagmi";
import {
  Row,
  Col,
  Form,
  Input,
  Button,
  Select,
  Collapse,
  notification,
} from "antd";
import { Address, ABI } from "../contracts/factoryContract";
import {
  FormOutlined,
  UserOutlined,
  MinusCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import useGetIsModerator from "../utils/isModerator";
import "../App.css";
import { Address as tokenAddress } from "../contracts/tokenContract";

const { Option } = Select;
const { Panel } = Collapse;

const CreateTWVotingForm = () => {
  const [title, setTitle] = useState("");
  const [proposalNames, setProposalNames] = useState([]);
  const [durationMinutes, setDurationMinutes] = useState(60);
  const isModerator = useGetIsModerator();

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

  const { config } = usePrepareContractWrite({
    address: Address,
    abi: ABI,
    functionName: "createTokenWeightedVoting",
    args: [title, proposalNames, durationMinutes, tokenAddress],
  });

  console.log(tokenAddress);

  const { isLoading, isSuccess, write } = useContractWrite(config);

  const durations = [
    { label: "1 hour", value: 60 },
    { label: "2 hours", value: 60 * 2 },
    { label: "12 hours", value: 60 * 12 },
    { label: "1 day", value: 60 * 24 },
    { label: "3 days", value: 60 * 24 * 3 },
    { label: "1 week", value: 60 * 24 * 7 },
    { label: "2 weeks", value: 60 * 24 * 14 },
    { label: "1 month", value: 60 * 24 * 30 },
  ];

  const getDurationInMinutes = (value) => {
    const duration = durations.find((duration) => duration.value === value);
    return duration ? duration.value : 1;
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

  if (isModerator === undefined) {
    return;
  }

  if (!isModerator) {
    return;
  }

  return (
    <>
      <Collapse
        className="custom-collapse"
        style={{
          marginTop: "20px",
          marginBottom: "20px",
          backgroundColor: "#fbd9d3",
          borderColor: "#fbd9d3",
        }}
        accordion
      >
        <Panel header="Create Token Weighted Voting" key="1">
          <Form layout="vertical">
            <Form.Item
              required={false}
              label="Title"
              name="title"
              tooltip="Title of the voting"
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

            <Form.List
              name="names"
              rules={[
                {
                  validator: async (_, names) => {
                    if (!names || names.length < 2) {
                      return Promise.reject(new Error("At least 2 proposals"));
                    }
                  },
                },
              ]}
            >
              {(fields, { add, remove }, { errors }) => (
                <>
                  {fields.map((field, index) => (
                    <Form.Item
                      label={index === 0 ? "Proposals" : ""}
                      tooltip={index === 0 ? "Proposals of the voting" : ""}
                      required={false}
                      key={field.key}
                    >
                      <Form.Item
                        {...field}
                        validateTrigger={["onChange", "onBlur"]}
                        rules={[
                          {
                            required: true,
                            whitespace: true,
                            message: "Please input proposal name",
                          },
                        ]}
                        noStyle
                      >
                        <Input
                          style={{}}
                          prefix={<UserOutlined style={{ color: "grey" }} />}
                          allowClear
                          value={proposalNames[index]}
                          onChange={(e) => {
                            const updatedProposalNames = [...proposalNames];
                            updatedProposalNames[index] = e.target.value;
                            setProposalNames(updatedProposalNames);
                          }}
                        />
                      </Form.Item>
                      {fields.length > 2 ? (
                        <MinusCircleOutlined
                          style={{
                            color: "grey",
                            position: "absolute",
                            marginTop: "9px",
                          }}
                          onClick={() => {
                            const updatedProposalNames = [...proposalNames];
                            updatedProposalNames.splice(index, 1);
                            setProposalNames(updatedProposalNames);
                            remove(field.name);
                          }}
                        />
                      ) : null}
                    </Form.Item>
                  ))}
                  <Form.Item style={{ textAlign: "center" }}>
                    <Button
                      type="dashed"
                      onClick={() => {
                        add();
                        const updatedProposalNames = [...proposalNames];
                        updatedProposalNames.push("");
                        setProposalNames(updatedProposalNames);
                      }}
                      style={{
                        width: "50%",
                      }}
                      icon={<PlusOutlined />}
                    >
                      Add Proposal
                    </Button>
                    <Form.ErrorList errors={errors} />
                  </Form.Item>
                </>
              )}
            </Form.List>
            <Form.Item>
              <Row justify="center" align="middle">
                <Col xs={24} sm={8} md={12} style={{ textAlign: "center" }}>
                  <>Duration: </>
                  <Select
                    style={{ width: "110px" }}
                    defaultValue={durations[0].value}
                    onChange={(value) =>
                      setDurationMinutes(getDurationInMinutes(value))
                    }
                  >
                    {durations.map((duration) => (
                      <Option key={duration.value} value={duration.value}>
                        {duration.label}
                      </Option>
                    ))}
                  </Select>
                </Col>
              </Row>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                onClick={() => write?.()}
              >
                Deploy TW Voting
              </Button>
            </Form.Item>
          </Form>
        </Panel>
      </Collapse>
    </>
  );
};

export default CreateTWVotingForm;
