import { Layout, Typography, Menu, Col, Row } from "antd";
import "@rainbow-me/rainbowkit/styles.css";
import { ConnectButton, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiConfig } from "wagmi";
import CreateVotingForm from "./components/CreateVotingForm";
import CreateIdentityForm from "./components/СreateIdentity";
import VotingList from "./components/VotingList";
import { getDefaultWallets } from "@rainbow-me/rainbowkit";
import { bscTestnet } from "wagmi/chains";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { publicProvider } from "wagmi/providers/public";
import { configureChains, createClient } from "wagmi";
import { GlobalOutlined } from "@ant-design/icons";
import { useState } from "react";
import "./App.css";
import IdentityInfoForm from "./components/IdentityInfo";
import StakingCards from "./components/StakingCards";
import AdminButtons from "./components/AdminButton";
import ModeratorButtons from "./components/ModeratorButton";

const { Header, Content } = Layout;
const { Title, Paragraph } = Typography;

const { chains, provider } = configureChains(
  [bscTestnet],
  [
    jsonRpcProvider({
      rpc: (bscTestnet) => ({
        http: "https://data-seed-prebsc-1-s1.binance.org:8545/",
      }),
    }),
    publicProvider(),
  ]
);

const { connectors } = getDefaultWallets({
  appName: "My RainbowKit App",
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

const App = () => {
  const [contentKey, setContentKey] = useState("welcome");

  const menuContent = {
    welcome: (
      <>
        <Title level={1}>Welcome to SOLYANKA DAO</Title>
        <Paragraph>
          This is the home page of SOLYANKA DAO. Click on the "Votings" menu
          item to access the main features. Click "Profile" to go to your
          profile.
        </Paragraph>
      </>
    ),
    votings: (
      <>
        <WagmiConfig client={wagmiClient}>
          <CreateVotingForm />
        </WagmiConfig>

        <WagmiConfig client={wagmiClient}>
          <CreateIdentityForm />
        </WagmiConfig>

        <WagmiConfig client={wagmiClient}>
          <VotingList />
        </WagmiConfig>
      </>
    ),
    staking: (
      <>
        <WagmiConfig client={wagmiClient}>
          <StakingCards />
        </WagmiConfig>
      </>
    ),
    profile: (
      <div style={{ textAlign: "center" }}>
        <WagmiConfig client={wagmiClient}>
          <IdentityInfoForm />
        </WagmiConfig>
        <WagmiConfig client={wagmiClient}>
          <AdminButtons />
        </WagmiConfig>
        <WagmiConfig client={wagmiClient}>
          <ModeratorButtons />
        </WagmiConfig>
      </div>
    ),
  };

  return (
    <Layout style={{ minWidth: "380px" }}>
      <Header>
        <Row justify="space-between" align="middle">
          <Col
            sm={{ span: 7, offset: 1 }}
            style={{ display: "flex", alignItems: "center" }}
          >
            <GlobalOutlined
              style={{ fontSize: "20px", color: "white", marginRight: "8px" }}
            />
            <Title level={4} style={{ color: "white", margin: 0 }}>
              SOLYANKA DAO
            </Title>
          </Col>
          <Col sm={6}>
            <Menu
              defaultSelectedKeys={["welcome"]}
              theme="dark"
              mode="horizontal"
              onClick={({ key }) => setContentKey(key)}
            >
              <Menu.Item key="welcome">Welcome</Menu.Item>
              <Menu.Item key="votings">Votings</Menu.Item>
              <Menu.Item key="staking">Staking</Menu.Item>
              <Menu.Item key="profile">Profile</Menu.Item>
            </Menu>
          </Col>
          <Col sm={5}>
            <WagmiConfig client={wagmiClient}>
              <RainbowKitProvider chains={chains}>
                <ConnectButton />
              </RainbowKitProvider>
            </WagmiConfig>
          </Col>
        </Row>
      </Header>
      <Content
        style={{
          margin: "0 auto",
          padding: "50px",
          width: "100%",
          maxWidth: "1500px"
        }}
      >
        <Row justify="center" gutter={[16, 16]}>
          <Col xs={24} sm={22} md={20} lg={18} xl={16}>
            {menuContent[contentKey]}
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default App;
