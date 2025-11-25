import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, Easing } from "react-native";
import colors from "@/constants/Colors";

export default function BubbleScanner({ active = true }) {
    const bubbles = Array.from({ length: 6 }, () => ({
        scale: new Animated.Value(0),
        opacity: new Animated.Value(0.4),
    }));

    useEffect(() => {
        if (!active) return;

        bubbles.forEach((bubble, i) => {
            Animated.loop(
                Animated.sequence([
                    Animated.parallel([
                        Animated.timing(bubble.scale, {
                            toValue: 1.6,
                            duration: 1800 + i * 200,
                            easing: Easing.out(Easing.ease),
                            useNativeDriver: true,
                        }),
                        Animated.timing(bubble.opacity, {
                            toValue: 0,
                            duration: 1800 + i * 200,
                            useNativeDriver: true,
                        }),
                    ]),
                    Animated.parallel([
                        Animated.timing(bubble.scale, {
                            toValue: 0,
                            duration: 0,
                            useNativeDriver: true,
                        }),
                        Animated.timing(bubble.opacity, {
                            toValue: 0.4,
                            duration: 0,
                            useNativeDriver: true,
                        }),
                    ]),
                ])
            ).start();
        });
    }, [active]);

    return (
        <View style={styles.container}>
            {bubbles.map((bubble, index) => (
                <Animated.View
                    key={index}
                    style={[
                        styles.bubble,
                        {
                            transform: [{ scale: bubble.scale }],
                            opacity: bubble.opacity,
                        },
                    ]}
                />
            ))}
            <View style={styles.centerDot} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 190,
        height: 190,
        justifyContent: "center",
        alignItems: "center",
    },
    bubble: {
        position: "absolute",
        width: 130,
        height: 130,
        borderRadius: 100,
        backgroundColor: colors.darkBlue,
    },
    centerDot: {
        width: 16,
        height: 16,
        borderRadius: 20,
        backgroundColor: colors.darkBlue,
    },
});
