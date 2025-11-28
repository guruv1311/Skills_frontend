export default function TabPanel({
  children,
  value,
  index,
}: {
  children: React.ReactNode;
  value: number;
  index: number;
}) {
  const isActive = value === index;

  return (
    <div role="tabpanel" hidden={!isActive}>
      {isActive && (
        <div style={{ paddingTop: "1rem", paddingBottom: "1rem" }} className="tab-panel-fade">
          {children}
        </div>
      )}
    </div>
  );
}
