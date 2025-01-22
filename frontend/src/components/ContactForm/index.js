import React, { useState, useEffect } from "react";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";
import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import CircularProgress from "@material-ui/core/CircularProgress";
import Autocomplete from '@material-ui/lab/Autocomplete';
import Chip from '@material-ui/core/Chip';
import { Grid } from "@material-ui/core";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import toastError from "../../errors/toastError";

const useStyles = makeStyles(theme => ({
	root: {
		display: "flex",
		flexWrap: "wrap",
	},
	textField: {
		marginRight: theme.spacing(1),
		flex: 1,
	},
	extraAttr: {
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
	},
	btnWrapper: {
		position: "relative",
	},
	buttonProgress: {
		color: green[500],
		position: "absolute",
		top: "50%",
		left: "50%",
		marginTop: -12,
		marginLeft: -12,
	},
    textCenter: {
        backgroundColor: 'red'
    }
}));

const ContactSchema = Yup.object().shape({
	name: Yup.string()
		.min(2, "Too Short!")
		.max(50, "Too Long!")
		.required("Required"),
	number: Yup.string().min(8, "Too Short!").max(50, "Too Long!"),
	email: Yup.string().email("Invalid email"),
    tags: Yup.array().of(Yup.object()) // Añadido para las etiquetas
});

export function ContactForm ({ initialContact, onSave, onCancel }) {
	const classes = useStyles();
	const [contact, setContact] = useState(initialContact);
    const [availableTags, setAvailableTags] = useState([]); // Nuevo estado para las etiquetas disponibles

    useEffect(() => {
        setContact(initialContact);
    }, [initialContact]);

    useEffect(() => {
        const fetchTags = async () => {
            try {
                const { data } = await api.get('/tags');
                setAvailableTags(data);
            } catch (err) {
                console.error("Error fetching tags", err);
            }
        };
        fetchTags();
    }, []);

	const handleSaveContact = async values => {
		try {
            const contactData = {
                ...values,
                tags: values.tags ? values.tags.map(tag => tag.id) : []
            };
			if (contact.id) {
				await api.put(`/contacts/${contact.id}`, contactData);
			} else {
				const { data } = await api.post("/contacts", contactData);
				if (onSave) {
					onSave(data);
				}
			}
			toast.success(i18n.t("contactModal.success"));
		} catch (err) {
			toastError(err);
		}
	};

    return (
        <Formik
            initialValues={contact}
            enableReinitialize={true}
            validationSchema={ContactSchema}
            onSubmit={(values, actions) => {
                setTimeout(() => {
                    handleSaveContact(values);
                    actions.setSubmitting(false);
                }, 400);
            }}
        >
            {({ values, errors, touched, isSubmitting, setFieldValue }) => (
                <Form>
                    <Grid container spacing={1}>
                        <Grid item xs={12}>
                            <Field
                                as={TextField}
                                label={i18n.t("contactModal.form.name")}
                                name="name"
                                autoFocus
                                error={touched.name && Boolean(errors.name)}
                                helperText={touched.name && errors.name}
                                variant="outlined"
                                margin="dense"
                                className={classes.textField}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Field
                                as={TextField}
                                label={i18n.t("contactModal.form.number")}
                                name="number"
                                error={touched.number && Boolean(errors.number)}
                                helperText={touched.number && errors.number}
                                placeholder="5513912344321"
                                variant="outlined"
                                margin="dense"
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Field
                                as={TextField}
                                label={i18n.t("contactModal.form.email")}
                                name="email"
                                error={touched.email && Boolean(errors.email)}
                                helperText={touched.email && errors.email}
                                placeholder="Email address"
                                fullWidth
                                margin="dense"
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Autocomplete
                                multiple
                                options={availableTags}
                                getOptionLabel={(option) => option.name}
                                value={values.tags || []}
                                onChange={(_, newValue) => {
                                    setFieldValue('tags', newValue);
                                }}
                                renderTags={(value, getTagProps) =>
                                    value.map((option, index) => (
                                        <Chip
                                            variant="outlined"
                                            label={option.name}
                                            {...getTagProps({ index })}
                                        />
                                    ))
                                }
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        variant="outlined"
                                        label={i18n.t("contactModal.form.tags")}
                                        placeholder={i18n.t("contactModal.form.addTags")}
                                        margin="dense"
                                        fullWidth
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} spacing={1}>
                            <Grid container spacing={1}>
                                <Grid xs={6} item>
                                    <Button
                                        onClick={onCancel}
                                        color="secondary"
                                        disabled={isSubmitting}
                                        variant="outlined"
                                        fullWidth
                                    >
                                        {i18n.t("contactModal.buttons.cancel")}
                                    </Button>
                                </Grid>
                                <Grid classes={classes.textCenter} xs={6} item>
                                    <Button
                                        type="submit"
                                        color="primary"
                                        disabled={isSubmitting}
                                        variant="contained"
                                        className={classes.btnWrapper}
                                        fullWidth
                                    >
                                        {contact.id
                                            ? `${i18n.t("contactModal.buttons.okEdit")}`
                                            : `${i18n.t("contactModal.buttons.okAdd")}`}
                                        {isSubmitting && (
                                            <CircularProgress
                                                size={24}
                                                className={classes.buttonProgress}
                                            />
                                        )}
                                    </Button>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Form>
            )}
        </Formik>
    )
}
