import { Client } from "pg";



export async function incrementVoteByBreedName(client: Client,breedName:string): Promise<number> {
    const voteCount =  (await client.query('UPDATE votes SET votes = votes + 1 WHERE breed_name = $1 RETURNING votes', [breedName]))
const voteNumber = voteCount.rows[0].votes
 return voteNumber

}

export async function doesBreedNameExists(client:Client,breedName:string): Promise<boolean> {
const existingBreed = await client.query('SELECT * FROM votes WHERE breed_name = $1',[breedName])
if (existingBreed.rows.length == 0) {
    return false
} 
return true
}


export async function newBreedRow(client:Client,breedName:string): Promise<number> {
 const newBreed = await client.query(`INSERT INTO votes (breed_name,votes) VALUES ($1,1) RETURNING votes`,[breedName]) 
const newBreedVote = newBreed.rows[0].votes
return newBreedVote
}