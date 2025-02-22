import {
    Box,
    useColorModeValue,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    Slider,
    SliderTrack,
    SliderFilledTrack,
    SliderThumb,
    Icon,
} from "@chakra-ui/react";
import { ThunderboltFilled } from "@ant-design/icons";
import useCustomToast from "../../hooks/useCustomToast";
import { useState } from "react";
import { nearStore } from "../../stores/near";

const ChargeModal = ({ nft, state }) => {

    const [isOpen, onClose] = state;
    const nearState = nearStore((state) => state);

    const sliderTrack = useColorModeValue("yellow.400", "yellow.400");
    const sliderTrackBg = useColorModeValue("yellow.100", "yellow.100");
    const sliderThumbColor = useColorModeValue("gray.900", "gray.900");
    const postBg = useColorModeValue("#d182ffda", "#171923");

    const toast = useCustomToast();
    const [sliderValue, setSliderValue] = useState(0);


    function updateSlider(e) {
        setSliderValue(e);
    }

    async function getTotalCharges(_tokenId, _charge) {
        // Get the post using the tokenId from supabase
        const { data, error } = await supabase
            .from("postnft")
            .select("id, totalCharged")
            .eq("id", _tokenId);
        console.log("data received from supabase", data);
        const newTotalCharge = data.totalCharged + _charge;
        // Update the post total charge on the db before setting the charge
        // on page reload
        setCharge(_tokenId, newTotalCharge);

        if (error) {
            toast(
                "error",
                "Post could not be fetched from Supabase! Error: " +
                    error.message,
                "supaErr",
            );
            throw error;
        } else {
            console.log(" post successfully updated to Supabase"),
                "supaSuccess";
            // redirect back to feed
        }
    }

    async function setCharge(_tokenId, _charge) {
        try {
            await nearState.cnftContract.set_charge({
                token_id: _tokenId.toString(),
                charge: _charge.toString(),
            });
            toast("success", "Charged " + _charge + "AEX$", "ChargeIderr");
        } catch (e) {
            console.log("set charge failed!", e);
        }
    }

    async function chargePost() {
        const amount = 11;
        nearState.tokenContract
            .ft_transfer(
                {
                    receiver_id: nft.owner_id,
                    amount: amount.toString(),
                    memo:
                        "Charge :zap: from " +
                        nearState?.accountId +
                        " for your AEXpost id." +
                        nft.token_id,
                },
                "300000000000000", // attached GAS (optional)
                1, // attached deposit in yoctoNEAR (optional)
            )
            .catch((e) => {
                console.log("Charge failed!", e);
                toast("error", "Charge failed!", "ChargeIderr");
            });
        //.then(() => setCharge(nft.tokenId, newAmount));
        onClose();
    }

    return (
        <Modal
            size="xl"
            isOpen={isOpen}
            onClose={() => {
                setSliderValue(0);
                onClose();
            }}
        >
            <ModalOverlay />
            <ModalContent bg={postBg}>
                <ModalHeader>Reward Post</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Box className="py-2 flex pr-2">
                        <Box className="mr-4 text-2xl">
                            <Icon as={ThunderboltFilled} color="yellow" />
                        </Box>

                        <Slider
                            onChange={updateSlider}
                            size={"lg"}
                            aria-label="pay-slider"
                            colorScheme={"yellow"}
                            defaultValue={0}
                        >
                            <SliderTrack bg={sliderTrackBg}>
                                <SliderFilledTrack bg={sliderTrack} />
                            </SliderTrack>
                            <SliderThumb color={sliderThumbColor} boxSize={6}>
                                <small>{sliderValue}</small>
                            </SliderThumb>
                        </Slider>
                    </Box>
                </ModalBody>

                <ModalFooter>
                    <Button
                        variant="ghost"
                        mr={3}
                        onClick={() => {
                            setSliderValue(0);
                            onClose();
                        }}
                    >
                        Close
                    </Button>
                    <Button colorScheme="blue" onClick={chargePost}>
                        Confirm
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default ChargeModal;
