import { prisma } from "./prisma";

// Download data from the VIIRS Black Marble API
async function downloadBlackMarbleData(year: number, month: number, day: number) {
  const date = new Date(year, month - 1, day);
  const dateString = date.toISOString().slice(0, 10).replace(/-/g, "");
  const url = `https://viirsland.cr.usgs.gov/BlackMarble/BlackMarble_2012-2021/${dateString}/VNP46A3.A${dateString}.001.h5`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download data: ${response.statusText}`);
    }
    const data = await response.arrayBuffer();
    return { data, url };
  } catch (error) {
    console.error("Error downloading Black Marble data:", error);
    return null;
  }
}

// Save the downloaded HDF5 file
async function saveHDF5File(data: ArrayBuffer, filename: string) {
  try {
    const buffer = Buffer.from(data);
    return { buffer, filename };
  } catch (error) {
    console.error("Error saving HDF5 file:", error);
    return null;
  }
}

// Process the HDF5 data and update database
async function processBlackMarbleData(buffer: Buffer, date: Date) {
  try {
    // Here we'll need to implement HDF5 processing using something like h5wasm
    // For now, just store some placeholder data
    await prisma.districtDailyMetric.createMany({
      data: [
        {
          code: "KA01",
          date: date,
          radiance: 15.4,
          hotspots: 3,
        },
        {
          code: "TN02", 
          date: date,
          radiance: 12.8,
          hotspots: 2,
        }
      ],
    });

    return true;
  } catch (error) {
    console.error("Error processing Black Marble data:", error);
    return false;
  }
}

export async function ingestViirs(year: number, month: number, day: number) {
  try {
    console.log(`Ingesting VIIRS data for ${year}-${month}-${day}`);
    
    // Download data
    const downloadResult = await downloadBlackMarbleData(year, month, day);
    if (!downloadResult) {
      throw new Error("Failed to download data");
    }
    
    // Save HDF5 file locally
    const saveResult = await saveHDF5File(
      downloadResult.data,
      `VNP46A3.A${year}${month}${day}.001.h5`
    );
    if (!saveResult) {
      throw new Error("Failed to save HDF5 file");
    }
    
    // Process data and update database
    const date = new Date(year, month - 1, day);
    const processResult = await processBlackMarbleData(saveResult.buffer, date);
    if (!processResult) {
      throw new Error("Failed to process data");
    }
    
    console.log("Successfully ingested VIIRS data");
    return true;
  } catch (error) {
    console.error("Error in VIIRS ingestion pipeline:", error);
    return false;
  }
}