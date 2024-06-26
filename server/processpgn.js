require('dotenv').config();
const { connectDB, client } = require('./azuredbconnect');
const fs = require('fs');

const processpgn = async (filePath) => {
    try {
        await connectDB();
        console.log('Connected to MongoDB');

        const db = client.db('main');
        
        const openingsCollection = db.collection('openings');
        await openingsCollection.createIndex({ ECO: 1, variation: 1 }, { unique: true }); 

        
        try {
            const foundOpenings = await openingsCollection.find({
              opening: "Sicilian Defense",
             
            }).toArray(); 
        
            console.log("Found openings:", foundOpenings);
        
          } catch (error) {
            console.error("Error finding openings:", error);
          }
        // const pgnContent = fs.readFileSync(filePath, 'utf-8');
        // const sections = pgnContent.split('[ECO "');

        // const openingsToInsert = []; 
        // let sectionCount = 0;
        // let totalSections = sections.length; 

        // for (const section of sections) {
        //     sectionCount++;
        //     if (!section.trim()) continue;

        //     const lines = section.split('\n');

          
        //     const ecoCode = lines[0].slice(0, -2); 

           
        //     const openingMatch = lines[1].match(/\[Opening "([^"]+)"\]/);
        //     const opening = openingMatch ? openingMatch[1] : null;
        //     const variationMatch = lines[2].match(/\[Variation "([^"]+)"\]/);
        //     const variation = variationMatch ? variationMatch[1] : null;

           
        //     const moves = lines
        //     .filter(line => !line.startsWith('[') && line.trim() !== '')  
        //     .flatMap(line => line.match(/\w\d\w\d/g) || [])  // Empty array if no match
        //     .map(move => move ? move.slice(2) : null)  // Handle null values from empty matches
        //     .filter(move => move !== null); // Remove null values (from invalid moves) 

            
        //     const newOpening = {
        //         ECO: ecoCode,
        //         opening,
        //         variation,
        //         moves
        //     };
        //     openingsToInsert.push(newOpening);

        //     // Log progress every 100 sections
        //     if (sectionCount % 100 === 0) {
        //         console.log(`Processed ${sectionCount} of ${totalSections} sections`);
        //     }
        // }

 
        // try {
        //     await openingsCollection.insertMany(openingsToInsert, { ordered: false }); // Continue on duplicate error
        // } catch (error) {
        //     if (error.code === 11000) { // Duplicate key error
        //         console.warn('Some openings were skipped due to duplicates.');
        //     } else {
        //         throw error; // Rethrow other errors
        //     }
        // }

        // console.log(`Successfully inserted ${openingsToInsert.length} openings into MongoDB`);

    } catch (error) {
        console.error('Error processing PGN:', error);
    } finally {
        client.close();
    }
};

const path = 'eco.pgn';
processpgn(path);