import * as React from "react";
import { useTranslation } from "react-i18next";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { Link } from "react-router-dom";

import { Typography } from "antd";
import * as L from "leaflet-extra-markers";

import { KnownAccountsContext } from "api/contexts/KnownAccounts";
import { NodeMonitor } from "api/hooks/use-node-monitors";

const { Title } = Typography;

// @ts-ignore
const nodeMarker = L.ExtraMarkers.icon({
  markerColor: "white",
  shape: "circle",
});

// @ts-ignore
const principalNodeMarker = L.ExtraMarkers.icon({
  markerColor: "cyan",
  shape: "star",
});

const getNodeLocations = async (): Promise<NodeLocation[] | undefined> => {
  try {
    const res = await fetch("/api/node-locations");
    const json = await res.json();

    return json;
  } catch (err) {
    return [];
  }
};

interface NodeLocation {
  ip: string;
  rawIp: string;
  nodeId: string;
  location: Location;
}

interface Location {
  asn: string;
  city: string;
  continent_code: string;
  country: string;
  country_name: string;
  currency: string;
  in_eu: boolean;
  latitude: number;
  longitude: number;
  org: string;
  region: string;
  timezone: string;
  utc_offset: string;
  version: string;
}

const Markers = React.memo(({ nodes }: { nodes: NodeLocation[] }) => {
  const { t } = useTranslation();

  return (
    <>
      {nodes.map(
        (
          {
            ip,
            // @ts-ignore
            isPrincipal,
            // @ts-ignore
            alias,
            // @ts-ignore
            account,
            nodeId,
            location: { latitude, longitude, ...rest },
          },
          index,
        ) => {
          if (!latitude || !longitude) {
            // @TODO Figure out why these IP doesn't give a lat/long
            return null;
          }

          return (
            <Marker
              key={index}
              position={{ lat: latitude, lng: longitude }}
              icon={isPrincipal ? principalNodeMarker : nodeMarker}
              zIndexOffset={isPrincipal ? 10 : 1}
            >
              <Popup>
                <>
                  {alias ? <strong style={{ display: "block" }}>{alias}</strong> : null}

                  <span className="break-word color-normal">{account || nodeId}</span>

                  {account ? (
                    <>
                      <br />
                      <Link to={`/account/${account}`}>{t("pages.status.viewAccount")}</Link>
                    </>
                  ) : null}
                </>
              </Popup>
            </Marker>
          );
        },
      )}
    </>
  );
});

interface Props {
  nodeMonitors: NodeMonitor[] | null;
  isLoading: boolean;
}

const NodeMap: React.FC<Props> = ({ nodeMonitors, isLoading }) => {
  const { t } = useTranslation();
  const [nodes, setNodes] = React.useState([] as NodeLocation[]);
  const { knownAccounts, isLoading: isKnownAccountsLoading } =
    React.useContext(KnownAccountsContext);

  React.useEffect(() => {
    if (isKnownAccountsLoading || isLoading) return;

    getNodeLocations().then(nodeLocations => {
      const nodes = nodeLocations?.map(nodeLocation => {
        const nodeMonitor = nodeMonitors?.find(({ rawIp }) => rawIp === nodeLocation.rawIp);
        const knownAccount = nodeMonitor
          ? knownAccounts.find(({ account }) => account === nodeMonitor.account)
          : null;

        return {
          ...nodeLocation,
          ...nodeMonitor,
          ...knownAccount,
        };
      })!;

      setNodes(nodes);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isKnownAccountsLoading]);

  return (
    <>
      <Title level={3}>
        {t("pages.status.nodeLocations", {
          count: nodes.length,
        })}
      </Title>
      <div style={{ marginBottom: "12px" }}>
        <MapContainer
          center={[25, 0]}
          zoom={2}
          minZoom={2}
          style={{ height: "500px" }}
          scrollWheelZoom={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Markers nodes={nodes} />
        </MapContainer>
      </div>
    </>
  );
};

export default NodeMap;
