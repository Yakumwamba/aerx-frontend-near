import { Box, VStack, Icon, Heading, Text, HStack } from "@chakra-ui/react";
import { ReceiveIconButton, SendIconButton} from "../../UI/Buttons";
import {ThunderboltFilled} from "@ant-design/icons";

const BalanceBar = ({ balance, ...rest }) => {
    return (
        <Box
            bgImage="/images/balance-bg.svg"
            bgColor="#ffff0006"
            bgPos="center"
            bgSize="cover"
            bgBlendMode="darken"
            borderRadius="lg"
            w="100%"
            py={3}
            >
            <VStack
               className="content-align-left px-4" 
            >   
                <Text className="font-semibold" >Your Balance</Text>
                <HStack>
                    <Icon color="yellow" as={ThunderboltFilled} />
                    <Heading size="md">{balance || 0}</Heading>
                </HStack>
                <HStack>
                    <SendIconButton />
                    <ReceiveIconButton />
                </HStack>
            </VStack>
        </Box>
    );
};

export default BalanceBar;