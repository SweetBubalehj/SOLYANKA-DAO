import {
  Layout,
  Typography,
  Menu,
  Col,
  Row,
  Collapse,
  QRCode,
  Space,
} from "antd";
import "@rainbow-me/rainbowkit/styles.css";
import { ConnectButton, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiConfig } from "wagmi";
import CreateVotingForm from "./components/CreateVotingForm";
import CreateIdentityForm from "./components/СreateIdentity";
import VotingCards from "./components/VotingCards";
import TWVotingCards from "./components/TWVotingCards";
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
import { Address } from "./contracts/tokenContract";
import CreateTWVotingForm from "./components/CreateTWVotinForm";

const { Header, Content, Footer } = Layout;
const { Title, Paragraph } = Typography;
const { Panel } = Collapse;

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
  const [text, setText] = useState(
    "https://1000.menu/cooking/13122-myasnaya-sbornaya-solyanka-s-kartoshkoj"
  );

  const menuContent = {
    welcome: (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Title code level={3}>
          function Welcome_To_SolyankaDAO(attention) public view returns
          (respect)
        </Title>
        <Paragraph style={{ fontSize: "14pt" }} code level={2}>
          console.log("This is the home page of SOLYANKA DAO. Click on the
          "Votings" menu item to access the main features. Click "Profile" to go
          to your profile.");
        </Paragraph>
        <Space style={{ height: "100%" }} direction="vertical" align="center">
          <QRCode
            size={330}
            icon="https://genshin-info.ru/upload/resize_cache/iblock/1e7/256_256_1d7a58ff99b324185ccb5ad5dfbdb5e85/Strannaya-solyanka-Arkhonta.png"
            value={text || "-"}
          />
        </Space>
      </div>
    ),
    votings: (
      <>
        <WagmiConfig client={wagmiClient}>
          <CreateVotingForm />
        </WagmiConfig>

        <WagmiConfig client={wagmiClient}>
          <CreateTWVotingForm />
        </WagmiConfig>

        <WagmiConfig client={wagmiClient}>
          <TWVotingCards />
        </WagmiConfig>
        
        <WagmiConfig client={wagmiClient}>
          <VotingCards />
        </WagmiConfig>

        <WagmiConfig client={wagmiClient}>
          <CreateIdentityForm />
        </WagmiConfig>
      </>
    ),
    staking: (
      <>
        <WagmiConfig client={wagmiClient}>
          <StakingCards />
        </WagmiConfig>

        <WagmiConfig client={wagmiClient}>
          <CreateIdentityForm />
        </WagmiConfig>
      </>
    ),
    profile: (
      <>
        <WagmiConfig client={wagmiClient}>
          <IdentityInfoForm />
        </WagmiConfig>

        <WagmiConfig client={wagmiClient}>
          <AdminButtons />
        </WagmiConfig>

        <WagmiConfig client={wagmiClient}>
          <ModeratorButtons />
        </WagmiConfig>

        <WagmiConfig client={wagmiClient}>
          <CreateIdentityForm />
        </WagmiConfig>
      </>
    ),
  };

  return (
    <Layout style={{ minWidth: "380px", minHeight: "100vh" }}>
      <Header>
        <Row justify="space-between" align="middle">
          <Col
            xs={12}
            sm={8}
            md={8}
            lg={8}
            xl={9}
            xxl={10}
            style={{ display: "flex", alignItems: "center" }}
          >
            <GlobalOutlined
              style={{ fontSize: "20px", color: "white", marginRight: "8px" }}
            />
            <Title level={4} style={{ color: "white", margin: 0 }}>
              SOLYANKA DAO
            </Title>
          </Col>
          <Col xs={4} sm={11} md={10} lg={10} xl={10} xxl={10}>
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
          <Col xs={8} sm={5} md={6} lg={6} xl={5} xxl={4}>
            <WagmiConfig client={wagmiClient}>
              <RainbowKitProvider chains={chains}>
                <ConnectButton />
              </RainbowKitProvider>
            </WagmiConfig>
          </Col>
        </Row>
      </Header>
      <Content
        className="site-layout"
        style={{
          margin: "0 auto",
          padding: 24,
          minHeight: 360,
          background: "#ffffff",
          width: "90%",
          maxWidth: "1500px",
        }}
      >
        <Row justify="center" gutter={[16, 16]}>
          <Col xs={24} sm={22} md={20} lg={18} xl={16}>
            {menuContent[contentKey]}
          </Col>
        </Row>
      </Content>
      <Footer style={{ textAlign: "center" }}>
        SOLYANKA Token Address: {Address}
        <br />
        SOLYANKA DAO ©2023
      </Footer>
    </Layout>
  );
};

export default App;
