const districts = fc.features.map((f) => {
  const { dtname, stcode11, dtcode11 } = f.properties;
  const stateCode = `IN-${stcode11}`;
  const code = `${stateCode}-${dtcode11}`;
  return {
    code,
    name: dtname,
    stateCode,
    geomGeoJSON: f.geometry,
  };
});

// in upsert:
await trx.district.upsert({
  where: { code: d.code },
  update: { name: d.name, stateCode: d.stateCode, geomGeoJSON: d.geomGeoJSON },
  create: d,
});
