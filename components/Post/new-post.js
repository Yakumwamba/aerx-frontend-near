import {
    Avatar,
    Box,
    Input,
    useColorMode,
    useColorModeValue,
} from "@chakra-ui/react";
import useCustomToast from "../../hooks/useCustomToast";
import { AddAudioIcon, AddIconButton , AddImageIcon, RepeatIconButton } from "../UI/IconButton";
import usePinata from "../../hooks/usePinata";
import { useState, useEffect, useRef } from "react";
import { nearStore } from "../../stores/near";
import { getBalance } from "../../lib/tokenContract";
import useTranslation from "next-translate/useTranslation";
import useFetchPosts from "../../hooks/useFetchPosts";
import { supabase, postToSupa } from "../../lib/supabaseClient";

function NewPost({ bg }) {
    const nearState = nearStore((state) => state);
    // const [balance, setBalance] = useState(0);
    const refresh = useFetchPosts();
    const toast = useCustomToast();

    // The uploaded image which will be deployed through IPFS
    const [uploadFile, setUploadFile] = useState();
    // Ipsf hook with details and upload hook.
    const ipfsData = usePinata(uploadFile, toast);

    const [body, setBody] = useState({
        text: "",
        media_type: "text",
    });

    const { t } = useTranslation("profile");
    const { colorMode } = useColorMode();
    const filter = colorMode === "light" ? "invert(0)" : "invert(0)";
    const fill = useColorModeValue("gray", "white");

    useEffect(() => {
        (async () => {
            if (nearState.tokenContract) {
                let { formatted } = await getBalance(nearState);
                toast(
                    "info",
                    "Your balance is " + formatted + " AEX$",
                    "BalanceId",
                );
            }
        })(); // IIFE
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function createPost() {
        if (!body.text) {
            toast("warning", "Post cannot be empty!", "feedpage");
            return;
        }

        let postToSave = {
            title: "AERX ContentNFT for " + nearState.accountId,
            description: body.text,
            media: ipfsData.fileUrl,
            media_hash: ipfsData.urlSha256,
            issued_at: new Date().toISOString(),
            extra: JSON.stringify(body),
        };
        console.log(body);
        console.log("Post to save: ", postToSave);
        try {
            const res = await nearState.cnftContract.nft_mint(
                {
                    receiver_id: nearState.accountId,
                    token_metadata: postToSave,
                },
                "300000000000000", // attached GAS (optional)
                "9660000000000000000111", // attached deposit in yoctoNEAR (optional))
            );
            console.log(res);
            toast(
                "success",
                "AERX PostNFT nr." + res.token_id + " minted successfully!",
                "CNFTsccss",
            );
            postToSave.tokenId = res.token_id;
            postToSave.ownerId = res.owner_id;
            postToSave.postId = res.token_id;
            postToSupa(postToSave, toast);
        } catch (e) {
            console.log("NFT could not be minted! Error: " + e.message);
            toast(
                "error",
                "NFT could not be minted! Error: " + e.message,
                "CNFTerror",
            );
        }
    }

    // Reffs to the content data
    const inputAudio = useRef(null);
    const onAudioClick = () => {
        inputAudio.current.click();
        setBody((prevBody) => {
            return {
                ...prevBody,
                type: "audio",
            };
        });
    };

    const inputImg = useRef(null);
    const onImgClick = () => {
        inputImg.current.click();
        setBody((prevBody) => {
            return {
                ...prevBody,
                type: "image",
            };
        });
    };
    function fileChange(event) {
        const { files } = event.target;
        if (files) {
            // // TODO check what type it is
            const filename = files[0].name;
            var parts = filename.split(".");
            const fileType = parts[parts.length - 1];
            setBody((prevBody) => {
                return {
                    ...prevBody,
                    media_extension: fileType,
                };
            });
            console.log(body);
            setUploadFile(() => event.target.files[0]);
        }
    }

    function update(e) {
        const path = e.currentTarget.dataset.path;
        const val = e.currentTarget.value;
        setBody((prevBody) => {
            return {
                ...prevBody,
                [path]: val,
            };
        });
    }

    // ! since refresh is a function itself it can be called directly once
    // to avoid it running more than once inside a useEffects
    // function clickRefresh() {
    //     if (!refresh) {
    //         setRefresh(true);
    //     }
    // }

    return (
        <Box
            flexDirection="row"
            display="flex"
            alignItems="center"
            bg={bg}
            px={4}
            py={2}
            borderRadius={5}
            className="sticky top-20 z-10 shadow-lg"
        >
            <Avatar
                size="xs"
                name={nearState.profile?.fullName}
                src={nearState.profile?.profileImg}
                mr={3}
            />

            <Input
                onChange={update}
                maxLength={500}
                type="text"
                data-path="text"
                placeholder={t("new")}
                borderRadius={20}
                filter={filter}
                size="sm"
                border="none"
                bg={useColorModeValue("white", "#1B1D1E")}
            />

            <Box onClick={onAudioClick} ml={3}><AddAudioIcon/></Box>
            <Box onClick={onImgClick} ml={2} opacity={0.7}><AddImageIcon/></Box>
            <Box display="none">
                <input ref={inputAudio} onChange={fileChange} type="file" />
            </Box>
            <Box onClick={refresh}><RepeatIconButton/></Box>
            <Box display="none">
                <input ref={inputImg} onChange={fileChange} type="file" />
            </Box>
            <Box onClick={createPost} ml={3}><AddIconButton /></Box>
        </Box>
    );
}

export default NewPost;
