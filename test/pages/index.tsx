import React from "react"
import * as icons from "seti-icons-react"
import styles from "./styles.module.scss"

export default class Index extends React.Component {
    public render() {
        return (
            <article className={styles.article}>
                <header>
                    <h1>ICONS</h1>
                </header>
                <main>
                    {
                        Object.entries(icons).map(([ name, Icon ], key1) =>
                            Object.keys(Icon.fill).map((fill, key2) =>
                                <figure key={`${key1}-${key2}`}>
                                    <Icon fill={fill as keyof typeof Icon.fill}/>
                                </figure>
                            )
                        )
                    }
                </main>
                <footer>
                    <span>{Object.values(icons).length}</span> icons in <span>{Object.values(icons).reduce((number, icon) => number + Object.keys(icon.fill).length, 0)}</span> variants
                </footer>
            </article>
        )
    }
}

