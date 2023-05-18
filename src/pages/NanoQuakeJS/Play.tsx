import * as React from "react";
import { useTranslation } from "react-i18next";

import { Button } from "antd";

// import { Button, Card, Col, Modal, Row, Tag, Typography } from "antd";
// import { CheckCircleTwoTone } from "@ant-design/icons";
import { PreferencesContext } from "api/contexts/Preferences";
import { Tracker } from "components/utils/analytics";

// const { Text } = Typography;

const servers: { [key: string]: Server } = {
  EU: {
    location: "Europe",
    ip: "78.129.253.179:27960",
    image: "/nanoquakejs/europe-globe.svg",
  },
  NA: {
    location: "North America",
    ip: "78.129.253.179:27960",
    image: "/nanoquakejs/north-america-globe.svg",
    isComingSoon: true,
  },
};

interface Server {
  location: string;
  ip: string;
  image: string;
  isComingSoon?: boolean;
}

// const Continent: React.FC<{ server: Server } & { isActive: boolean }> = ({
//   server: { location, image, isComingSoon },
//   isActive,
// }) => {
//   const { t } = useTranslation();
//   return (
//     <div
//       style={{
//         textAlign: "center",
//         cursor: isComingSoon ? "cursor" : "pointer",
//         position: "relative",
//         userSelect: "none",
//       }}
//     >
//       {isActive ? (
//         <CheckCircleTwoTone
//           style={{ position: "absolute", top: 0, right: 0 }}
//         />
//       ) : null}
//       {isComingSoon ? (
//         <Tag style={{ position: "absolute", top: 0, right: 0, zIndex: 2 }}>
//           {t("common.comingSoon")}
//         </Tag>
//       ) : null}
//       <img
//         draggable={false}
//         src={image}
//         alt="text"
//         width="50%"
//         style={!isActive ? { filter: "grayscale(100%)", opacity: "50%" } : {}}
//       />
//       <br />
//       {location}
//     </div>
//   );
// };

const Play: React.FC = () => {
  const { t } = useTranslation();
  // const [isOpen, setIsOpen] = React.useState(false);
  const {
    nanoQuakeJSUsername,
    // nanoQuakeJSServer,
    // setNanoQuakeJSServer,
  } = React.useContext(PreferencesContext);
  // const [selectedContinent, setSelectedContinent] = React.useState(
  //   nanoQuakeJSServer || "EU",
  // );
  const selectedContinent = "EU";

  return (
    <>
      <Button
        type="primary"
        size="large"
        shape="round"
        href={`http://www.quakejs.com/play?connect%20${servers[selectedContinent]?.ip}&name%20${nanoQuakeJSUsername}`}
        target={"_blank"}
        onClick={() => {
          Tracker.ga4?.gtag("event", "NanoQuakeJS - Play", {
            server: selectedContinent,
          });
        }}
        // onClick={() => setIsOpen(true)}
      >
        {t("pages.nanoquakejs.playNow")}
      </Button>
      {/* <Modal
        title={t("pages.nanoquakejs.chooseLocation")}
        open={isOpen}
        // @ts-ignore
        onOk={() => {
          setIsOpen(false);
        }}
        okText={t("pages.nanoquakejs.launchGame")}
        okButtonProps={{
          disabled: !selectedContinent,
          href: selectedContinent
            ? `http://www.quakejs.com/play?connect%20${servers[selectedContinent]?.ip}&name%20${nanoQuakeJSUsername}`
            : undefined,
          target: "_blank",
          onClick: () => {
            setNanoQuakeJSServer(selectedContinent);
            Tracker.ga4?.gtag("event", "NanoQuakeJS - Play", {
              server: selectedContinent,
            });
          },
        }}
        onCancel={() => setIsOpen(false)}
        cancelText={t("common.cancel")}
      >
        <Row gutter={12}>
          {Object.entries(servers).map(([continent, server]) => (
            <Col xs={12} key={continent}>
              <Card
                size="small"
                onClick={() => {
                  if (!server.isComingSoon) {
                    setSelectedContinent(continent);
                  }
                }}
                style={{
                  width: "100%",
                  borderColor:
                    continent === selectedContinent ? "rgb(24, 144, 255)" : "",
                }}
              >
                <Continent
                  server={server}
                  isActive={continent === selectedContinent}
                />
              </Card>
            </Col>
          ))}
          <Text>{t("pages.nanoquakejs.chooseLocationDescription")}</Text>
        </Row>
      </Modal> */}
    </>
  );
};

export default Play;
