import { animate, group, query, style, transition, trigger } from '@angular/animations';

export const slideInOutTrigger = trigger("slideInOut", [
    transition(
        ":increment",
        group([
            query(":enter", [
                style({
                    transform: "translateX(-200%)",
                    filter: "blur(5px)",
                    opacity: 0.7
                }),
                animate(
                    "400ms ease-in-out",
                    style({
                        transform: "translateX(0%)",
                        filter: "blur(0px)",
                        opacity: 1
                    })
                )
            ]),
            query(":leave", [
                animate(
                    "400ms ease-in",
                    style({
                        transform: "translateX(100%)",
                        filter: "blur(2px)",
                        opacity: 0.9
                    })
                )
            ])
        ])
    ),
    transition(
        ":decrement",
        group([
            query(":enter", [
                style({
                    transform: "translateX(200%)",
                    filter: "blur(5px)",
                    opacity: 0.7
                }),
                animate(
                    "400ms ease-in-out",
                    style({
                        transform: "translateX(0%)",
                        filter: "blur(0px)",
                        opacity: 1
                    })
                )
            ]),
            query(":leave", [
                animate(
                    "400ms ease-in",
                    style({
                        transform: "translateX(-100%)",
                        filter: "blur(2px)",
                        opacity: 0.9
                    })
                )
            ])
        ])
    )
]);