import { createClient as supabaseClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import { createClient as urqlClient } from "urql";

// Prepare API key and Authorization header
const headers = {
    apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    authorization: `Bearer: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
};

// Create GraphQL client
// See: https://formidable.com/open-source/urql/docs/basics/react-preact/#setting-up-the-client

export const supabaseGraphQLClient = urqlClient({
    url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/graphql/v1`,
    fetchOptions: function createFetchOptions() {
        return { headers };
    },
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = supabaseClient(supabaseUrl, supabaseAnonKey);


export async function profileToSupa(res, profile, profileToSave, toast) {
	const issuedExtra = JSON.parse(profileToSave.extra)
	var issuedTime = 0
	if (typeof issuedExtra.metadata === 'undefined' ) {
		issuedTime = profileToSave.issued_at;
		} else {
				issuedTime = issuedExtra.metadata.issued_at;
				} 
	
    const [
        hobbys,
        username,
        fullname,
        about_me,
        city,
        country,
        avatar_url,
        extra,
        created_at,
    ] = [
        profile.hobbys,
        profile.username,
        profile.fullName,
        profile.aboutMe,
        profile.city,
        profile.country,
        profile.profileImg,
        profileToSave.extra,
        issuedTime,
    ];

    // Insert into Profile
    const { data, error } = await supabase.from("profile").upsert([
        {
            hobbys,
            token_id: profileToSave.username,
            username,
            fullname,
            about_me,
            city,
            country,
            avatar_url,
            extra,
            created_at,
            updated_at: new Date(),
        },
    ]);

    if (error) {
        toast(
            "error",
            "Post could not be uploaded to Supabase! Error: " + error.message,
            "supaErr",
        );
        throw error;
    } else {
        console.log("Uploaded successfully to Supabase", data);
        // redirect back to feed
    }
}


// Upload new post to Supabase
export async function postToSupa(postToSave, toast) {
    //Upload the contentNFT to Supabase
    postToSave.totalCharged = 0;
    postToSave.media_type = "text";
    postToSave.updatedAt = postToSave.issued_at;
    postToSave.pnft_id = postToSave.postId;
    const [
        owner_id,
        token_id,
        description,
        title,
        media,
        media_hash,
        media_type,
        created_at,
        updated_at,
        extra,
        total_charged,
        pnft_id
    ] = [
        postToSave.ownerId,
        postToSave.tokenId,
        postToSave.description,
        postToSave.title,
        postToSave.media,
        postToSave.media_hash,
        postToSave.media_type,
        postToSave.issued_at,
        postToSave.updatedAt,
        postToSave.extra,
        postToSave.totalCharged,
        postToSave.pnft_id
    ];

    // Insert into account
    const { data, error } = await supabase.from("post").upsert([
        {
            //owner_id,
            title,
            description,
            created_at,
            updated_at,
        },
    ]);

    if (error) {
        toast(
            "error",
            "Post could not be uploaded to Supabase! Error: " + error.message,
            "supaErr",
        );
        throw error;
    } else if (data) {
        const { data, error } = await supabase.from("post_nft").insert([
            {
                post_id: pnft_id,
                title,
                media,
                media_type,
                media_hash,
                total_charged,
                extra,
                status: "PENDING",
                created_at,
                updated_at,
            },
        ]);
        if (error) {
            toast(
                "error",
                "Post could not be uploaded to Supabase! Error: " + error.message,
                "supaErr",
            );
            throw error;
        }
        console.log("Uploaded successfully to Supabase", data);
        // redirect back to feed
    }
}


export async function fileUpload(file) {
    if (file) {
        const { data, error } = await supabase.storage
            .from("contentnft")
            .upload(file.name, file, {
                cacheControl: "3600",
                upsert: false,
            });

        console.log("File uploaded to supabase", file);
        if (error) {
            toast(
                "error",
                "File could not be uploaded! Error: " + error.message,
            );
            throw error;
        } else {
            console.log(data + " Uploaded successfully to Supabase");
        }
    } else {
        console.log(`Error! Please check the ${file} and try again.`);
    }
}
