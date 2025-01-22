import React, { useContext, useEffect, useRef, useState, useMemo } from "react";
import { Field, Form, Formik } from "formik";
import { toast } from "react-toastify";
import * as Yup from "yup";
import moment from "moment-timezone";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Grid,
  Box,
  Tab,
  Tabs,
} from "@material-ui/core";
import { green } from "@material-ui/core/colors";
import { makeStyles } from "@material-ui/core/styles";
import { AttachFile as AttachFileIcon, DeleteOutline as DeleteOutlineIcon } from "@material-ui/icons";
import Autocomplete from '@material-ui/lab/Autocomplete';

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import ConfirmationModal from "../ConfirmationModal";
import MessageVariablesPicker from "../MessageVariablesPicker";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
    backgroundColor: "#fff"
  },
  tabmsg: {
    backgroundColor: theme.palette.campaigntab,
  },
  textField: {
    marginRight: theme.spacing(1),
    flex: 1,
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
}));

const CampaignSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Too Short!")
    .max(50, "Too Long!")
    .required("Required"),
  status: Yup.string().oneOf(['Inactiva', 'PROGRAMADA', 'Proceso', 'PAUSADA', 'CANCELADA', 'FINALIZADA'], "Estado inválido"),
  whatsappId: Yup.string().required("WhatsApp is required"),
  scheduledAt: Yup.date()
    .min(moment().add(1, 'minutes'), "La fecha debe ser al menos 1 minutos en el futuro")
    .required("La fecha es requerida"),
});

const CampaignModal = ({ open, onClose, campaignId, initialValues, onSave, resetPagination }) => {
  const classes = useStyles();
  const isMounted = useRef(true);
  const { user } = useContext(AuthContext);
  const { companyId } = user;
  const [file, setFile] = useState(null);

  const initialState = {
    name: "",
    message1: "",
    message2: "",
    message3: "",
    message4: "",
    message5: "",
    confirmationMessage1: "",
    confirmationMessage2: "",
    confirmationMessage3: "",
    confirmationMessage4: "",
    confirmationMessage5: "",
    status: "Inactiva",
    confirmation: false,
    scheduledAt: "",
    whatsappId: "",
    contactListId: "",
    tagListId: "Ninguna",
    companyId,
  };

  const [campaign, setCampaign] = useState(initialState);
  const [whatsapps, setWhatsapps] = useState([]);
  const [contactLists, setContactLists] = useState([]);
  const [tagLists, setTagLists] = useState([]);
  const [messageTab, setMessageTab] = useState(0);
  const [attachment, setAttachment] = useState(null);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [campaignEditable, setCampaignEditable] = useState(true);
  const attachmentFile = useRef(null);

  const memoizedContactLists = useMemo(() => contactLists, [contactLists]);
  const memoizedTagLists = useMemo(() => tagLists, [tagLists]);
  const memoizedWhatsapps = useMemo(() => whatsapps, [whatsapps]);
  const memoizedFiles = useMemo(() => file, [file]);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/files/", {
          params: { companyId }
        });
        setFile(data.files);
      } catch (err) {
        toastError(err);
      }
    })();
  }, [companyId]);

  useEffect(() => {
    if (isMounted.current) {
      if (initialValues) {
        setCampaign((prevState) => {
          return { ...prevState, ...initialValues };
        });
      }

      api.get(`/contact-lists/list`, { params: { companyId } })
        .then(({ data }) => setContactLists(data));

      api.get(`/whatsapp`, { params: { companyId, session: 0 } })
        .then(({ data }) => setWhatsapps(data));

      api.get(`/tags`, { params: { companyId } })
        .then(({ data }) => {
          const fetchedTags = data.tags;
          const formattedTagLists = fetchedTags.map((tag) => ({
            id: tag.id,
            name: tag.name,
          }));
          setTagLists(formattedTagLists);
        })
        .catch((error) => {
          console.error("Error retrieving tags:", error);
        });
        
        if (campaignId) {
          api.get(`/campaigns/${campaignId}`).then(({ data }) => {
            setCampaign((prev) => {
              let prevCampaignData = { ...prev };
  
              Object.entries(data).forEach(([key, value]) => {
                if (key === "scheduledAt" && value !== "" && value !== null) {
                  // Convertir UTC a hora local
                  prevCampaignData[key] = moment.utc(value).local().format("YYYY-MM-DDTHH:mm");
                } else {
                  prevCampaignData[key] = value === null ? "" : value;
                }
              });
  
              return prevCampaignData;
            });
          });
        }
      }
    }, [campaignId, initialValues, companyId]);

  useEffect(() => {
    const now = moment();
    const scheduledAt = moment(campaign.scheduledAt);
    const moreThenAnHour =
      !Number.isNaN(scheduledAt.diff(now)) && scheduledAt.diff(now, "hour") > 1;
    const isEditable =
      campaign.status === "Inactiva" ||
      (campaign.status === "PROGRAMADA" && moreThenAnHour);

    setCampaignEditable(isEditable);
  }, [campaign.status, campaign.scheduledAt]);

  const handleClose = () => {
    onClose();
    setCampaign(initialState);
  };

  const handleAttachmentFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAttachment(file);
    }
  };

  const handleSaveCampaign = async (values) => {
    try {
      const dataValues = {};
      Object.entries(values).forEach(([key, value]) => {
        if (key === "scheduledAt" && value !== "" && value !== null) {
          // Convert local time to UTC
          dataValues[key] = moment.tz(value, moment.tz.guess()).utc().format("YYYY-MM-DD HH:mm:ss");
        } else {
          dataValues[key] = value === "" ? null : value;
        }
      });
  
      if (!dataValues.whatsappId) {
        throw new Error(i18n.t("campaigns.errors.noWhatsapp"));
      }
  
      if (!dataValues.contactListId && !dataValues.tagListId) {
        throw new Error(i18n.t("campaigns.errors.noContactOrTag"));
      }
  
      let savedCampaign;
      if (campaignId) {
        const { data } = await api.put(`/campaigns/${campaignId}`, dataValues);
        savedCampaign = data;
        toast.success(i18n.t("campaigns.toasts.updated"));
      } else {
        const { data } = await api.post("/campaigns", dataValues);
        savedCampaign = data;
        toast.success(i18n.t("campaigns.toasts.created"));
      }
  
      if (attachment != null) {
        const formData = new FormData();
        formData.append("file", attachment);
        await api.post(`/campaigns/${savedCampaign.id}/media-upload`, formData);
      }
  
      if (onSave) {
        onSave(savedCampaign);
      }
  
      setCampaign(savedCampaign);
      handleClose();
    } catch (err) {
      console.log(err);
      toastError(err.response?.data?.error || err.message);
    }
  };

  const deleteMedia = async () => {
    if (attachment) {
      setAttachment(null);
      attachmentFile.current.value = null;
    }

    if (campaign.mediaPath) {
      await api.delete(`/campaigns/${campaign.id}/media-upload`);
      setCampaign((prev) => ({ ...prev, mediaPath: null, mediaName: null }));
      toast.success(i18n.t("campaigns.toasts.deleted"));
    }
  };

  const cancelCampaign = async () => {
    try {
      await api.post(`/campaigns/${campaign.id}/cancel`);
      toast.success(i18n.t("campaigns.toasts.cancel"));
      setCampaign((prev) => ({ ...prev, status: "CANCELADA" }));
      resetPagination();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const restartCampaign = async () => {
    try {
      await api.post(`/campaigns/${campaign.id}/restart`);
      toast.success(i18n.t("campaigns.toasts.restart"));
      setCampaign((prev) => ({ ...prev, status: "Proceso" }));
      resetPagination();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const renderMessageField = (identifier) => {
    return (
      <Box mb={2}>
        <Field
          as={TextField}
          id={identifier}
          name={identifier}
          fullWidth
          rows={5}
          multiline
          variant="outlined"
          label={i18n.t(`campaigns.dialog.form.${identifier}`)}
          disabled={!campaignEditable && campaign.status !== "CANCELADA"}
        />
        <MessageVariablesPicker
          disabled={!campaignEditable && campaign.status !== "CANCELADA"}
          onClick={(variable) => {
            const el = document.getElementById(identifier);
            const start = el.selectionStart;
            const end = el.selectionEnd;
            el.setRangeText(variable, start, end, 'select');
          }}
        />
      </Box>
    );
  };

  return (
    <div className={classes.root}>
      <ConfirmationModal
        title={i18n.t("campaigns.confirmationModal.deleteTitle")}
        open={confirmationOpen}
        onClose={() => setConfirmationOpen(false)}
        onConfirm={deleteMedia}
      >
        {i18n.t("campaigns.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="md"
        scroll="paper"
      >
        <DialogTitle>
          {campaignId
            ? i18n.t("campaigns.dialog.update")
            : i18n.t("campaigns.dialog.new")}
        </DialogTitle>
        <Formik
          initialValues={campaign}
          enableReinitialize={true}
          validationSchema={CampaignSchema}
          onSubmit={handleSaveCampaign}
        >
          {({ values, errors, touched, isSubmitting, setFieldValue }) => (
            <Form>
              <DialogContent dividers>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      label={i18n.t("campaigns.dialog.form.name")}
                      name="name"
                      error={touched.name && Boolean(errors.name)}
                      helperText={touched.name && errors.name}
                      variant="outlined"
                      fullWidth
                      className={classes.textField}
                      disabled={!campaignEditable}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Autocomplete
                      options={memoizedContactLists}
                      getOptionLabel={(option) => option.name}
                      value={memoizedContactLists.find(list => list.id === values.contactListId) || null}
                      onChange={(e, newValue) => {
                        setFieldValue("contactListId", newValue ? newValue.id : "");
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={i18n.t("campaigns.dialog.form.contactList")}
                          variant="outlined"
                          error={touched.contactListId && Boolean(errors.contactListId)}
                          helperText={touched.contactListId && errors.contactListId}
                        />
                      )}
                      disabled={!campaignEditable}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Autocomplete
                      options={memoizedTagLists}
                      getOptionLabel={(option) => option.name}
                      value={memoizedTagLists.find(tag => tag.id === values.tagListId) || null}
                      onChange={(e, newValue) => {
                        setFieldValue("tagListId", newValue ? newValue.id : "");
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={i18n.t("campaigns.dialog.form.tagList")}
                          variant="outlined"
                          error={touched.tagListId && Boolean(errors.tagListId)}
                          helperText={touched.tagListId && errors.tagListId}
                        />
                      )}
                      disabled={!campaignEditable}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Autocomplete
                      options={memoizedWhatsapps}
                      getOptionLabel={(option) => option.name}
                      value={memoizedWhatsapps.find(whatsapp => whatsapp.id === values.whatsappId) || null}
                      onChange={(e, newValue) => {
                        setFieldValue("whatsappId", newValue ? newValue.id : "");
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={i18n.t("campaigns.dialog.form.whatsapp")}
                          variant="outlined"
                          error={touched.whatsappId && Boolean(errors.whatsappId)}
                          helperText={touched.whatsappId && errors.whatsappId}
                        />
                      )}
                      disabled={!campaignEditable}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                  <Field
                      as={TextField}
                      label={i18n.t("campaigns.dialog.form.scheduledAt")}
                      name="scheduledAt"
                      type="datetime-local"
                      InputLabelProps={{
                        shrink: true,
                      }}
                      inputProps={{
                        step: 60, // 1 minuto
                      }}
                      error={touched.scheduledAt && Boolean(errors.scheduledAt)}
                      helperText={touched.scheduledAt && errors.scheduledAt}
                      variant="outlined"
                      fullWidth
                      className={classes.textField}
                      disabled={!campaignEditable}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Autocomplete
                      options={memoizedFiles}
                      getOptionLabel={(option) => option.name}
                      value={memoizedFiles.find(f => f.id === values.fileListId) || null}
                      onChange={(e, newValue) => {
                        setFieldValue("fileListId", newValue ? newValue.id : "");
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={i18n.t("campaigns.dialog.form.fileList")}
                          variant="outlined"
                          error={touched.fileListId && Boolean(errors.fileListId)}
                          helperText={touched.fileListId && errors.fileListId}
                        />
                      )}
                      disabled={!campaignEditable}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Tabs
                      value={messageTab}
                      indicatorColor="primary"
                      textColor="primary"
                      onChange={(e, newValue) => setMessageTab(newValue)}
                      variant="fullWidth"
                      centered
                      className={classes.tabmsg}
                    >
                      <Tab label="Msg. 1" />
                      <Tab label="Msg. 2" />
                      <Tab label="Msg. 3" />
                      <Tab label="Msg. 4" />
                      <Tab label="Msg. 5" />
                    </Tabs>
                    <Box mt={2}>
                      {messageTab === 0 && renderMessageField("message1")}
                      {messageTab === 1 && renderMessageField("message2")}
                      {messageTab === 2 && renderMessageField("message3")}
                      {messageTab === 3 && renderMessageField("message4")}
                      {messageTab === 4 && renderMessageField("message5")}
                    </Box>
                  </Grid>
                  {(campaign.mediaPath || attachment) && (
                    <Grid item xs={12}>
                      <Button startIcon={<AttachFileIcon />}>
                        {attachment != null
                          ? attachment.name
                          : campaign.mediaName}
                      </Button>
                      {campaignEditable && (
                        <IconButton
                          onClick={() => setConfirmationOpen(true)}
                          color="secondary"
                        >
                          <DeleteOutlineIcon />
                        </IconButton>
                      )}
                    </Grid>
                  )}
                </Grid>
              </DialogContent>
              <DialogActions>
                {campaign.status === "CANCELADA" && (
                  <Button
                    color="primary"
                    onClick={restartCampaign}
                    variant="outlined"
                  >
                    {i18n.t("campaigns.dialog.buttons.restart")}
                  </Button>
                )}
                {campaign.status === "Proceso" && (
                  <Button
                    color="primary"
                    onClick={cancelCampaign}
                    variant="outlined"
                  >
                    {i18n.t("campaigns.dialog.buttons.cancel")}
                  </Button>
                )}
                {!attachment && !campaign.mediaPath && campaignEditable && (
                  <Button
                    color="primary"
                    onClick={() => attachmentFile.current.click()}
                    disabled={isSubmitting}
                    variant="outlined"
                  >
                    {i18n.t("campaigns.dialog.buttons.attach")}
                  </Button>
                )}
                <Button
                  onClick={handleClose}
                  color="secondary"
                  disabled={isSubmitting}
                  variant="outlined"
                >
                  {i18n.t("campaigns.dialog.buttons.close")}
                </Button>
                {(campaignEditable || campaign.status === "CANCELADA") && (
                  <Button
                    type="submit"
                    color="primary"
                    disabled={isSubmitting}
                    variant="contained"
                    className={classes.btnWrapper}
                  >
                    {campaignId
                      ? i18n.t("campaigns.dialog.buttons.edit")
                      : i18n.t("campaigns.dialog.buttons.add")}
                    {isSubmitting && (
                      <CircularProgress
                        size={24}
                        className={classes.buttonProgress}
                      />
                    )}
                  </Button>
                )}
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
      <input
        type="file"
        ref={attachmentFile}
        style={{ display: "none" }}
        onChange={(e) => handleAttachmentFile(e)}
      />
    </div>
  );
};

export default CampaignModal;